/**
 * Compara N snapshots de swagger e produz o relatório de divergência (§5.1.1
 * da spec). A divergência é por VERSÃO IMPLANTADA, não por identidade de
 * tenant ou domínio — qualquer operação ou propriedade pode faltar em
 * qualquer instância, e nenhuma delas é "a" referência.
 */

import { isObjectSchema, listOperations, listSchemaNames, type OpenApiDocument } from "./openapi-doc";

export interface SampledInstance {
  readonly label: string;
  readonly url: string;
  readonly document: OpenApiDocument;
}

export interface ExclusiveOperations {
  readonly label: string;
  readonly operations: readonly string[];
}

export interface DivergentProperty {
  readonly schema: string;
  readonly property: string;
  /** Labels das instâncias que TÊM essa propriedade — sempre menos que o total de instâncias que declaram o schema. */
  readonly presentIn: readonly string[];
}

export interface ExclusiveSchema {
  readonly label: string;
  readonly schemas: readonly string[];
}

export interface DivergenceReport {
  readonly instances: readonly { readonly label: string; readonly url: string; readonly operationCount: number; readonly schemaCount: number }[];
  readonly unionOperationCount: number;
  readonly unionSchemaCount: number;
  readonly exclusiveOperationsByInstance: readonly ExclusiveOperations[];
  readonly exclusiveSchemasByInstance: readonly ExclusiveSchema[];
  readonly divergentProperties: readonly DivergentProperty[];
}

function sorted(iterable: Iterable<string>): string[] {
  return [...iterable].sort();
}

export function buildDivergenceReport(instances: readonly SampledInstance[]): DivergenceReport {
  const perInstanceOps = instances.map((i) => ({ label: i.label, ops: listOperations(i.document) }));
  const perInstanceSchemas = instances.map((i) => ({ label: i.label, schemas: listSchemaNames(i.document) }));

  const unionOps = new Set<string>();
  for (const { ops } of perInstanceOps) for (const op of ops) unionOps.add(op);

  const unionSchemas = new Set<string>();
  for (const { schemas } of perInstanceSchemas) for (const s of schemas) unionSchemas.add(s);

  // Exclusividade só faz sentido havendo o que comparar. Com 1 instância,
  // ".some" sobre lista vazia dá sempre `false` e marcaria tudo como
  // exclusivo — bug pego pelo próprio teste sintético (R1).
  const hasComparison = instances.length >= 2;

  const exclusiveOperationsByInstance = hasComparison
    ? perInstanceOps
      .map(({ label, ops }) => ({
        label,
        operations: sorted([...ops].filter((op) => !perInstanceOps.some((other) => other.label !== label && other.ops.has(op)))),
      }))
      .filter((e) => e.operations.length > 0)
    : [];

  const exclusiveSchemasByInstance = hasComparison
    ? perInstanceSchemas
      .map(({ label, schemas }) => ({
        label,
        schemas: sorted([...schemas].filter((s) => !perInstanceSchemas.some((other) => other.label !== label && other.schemas.has(s)))),
      }))
      .filter((e) => e.schemas.length > 0)
    : [];

  const divergentProperties = hasComparison ? diffSchemaProperties(instances) : [];

  return {
    instances: instances.map((i, idx) => ({
      label: i.label,
      url: i.url,
      operationCount: perInstanceOps[idx]!.ops.size,
      schemaCount: perInstanceSchemas[idx]!.schemas.size,
    })),
    unionOperationCount: unionOps.size,
    unionSchemaCount: unionSchemas.size,
    exclusiveOperationsByInstance,
    exclusiveSchemasByInstance,
    divergentProperties,
  };
}

/**
 * Para cada schema declarado em 2+ instâncias, propriedade que não existe em
 * TODAS as instâncias que declaram o schema é divergente (ex.: Q15 —
 * `SendMediaMessage.ticketStrategy` só na instância da zapplataforma).
 */
function diffSchemaProperties(instances: readonly SampledInstance[]): DivergentProperty[] {
  const schemaNames = new Set<string>();
  for (const instance of instances) for (const name of listSchemaNames(instance.document)) schemaNames.add(name);

  const result: DivergentProperty[] = [];

  for (const schemaName of sorted(schemaNames)) {
    const propsByInstance = new Map<string, ReadonlySet<string>>();

    for (const instance of instances) {
      const schema = instance.document.components?.schemas?.[schemaName];
      if (isObjectSchema(schema)) {
        propsByInstance.set(instance.label, new Set(Object.keys(schema.properties ?? {})));
      }
    }

    if (propsByInstance.size < 2) continue;

    const allProps = new Set<string>();
    for (const props of propsByInstance.values()) for (const p of props) allProps.add(p);

    for (const property of sorted(allProps)) {
      const presentIn = [...propsByInstance.entries()].filter(([, props]) => props.has(property)).map(([label]) => label);
      if (presentIn.length < propsByInstance.size) {
        result.push({ schema: schemaName, property, presentIn: sorted(presentIn) });
      }
    }
  }

  return result;
}

export function formatDivergenceReport(report: DivergenceReport): string {
  const lines: string[] = [];

  const labelWidth = Math.max(...report.instances.map((i) => i.label.length), "união".length);
  for (const instance of report.instances) {
    lines.push(`${instance.label.padEnd(labelWidth)}  ${instance.operationCount} ops, ${instance.schemaCount} schemas  (${instance.url})`);
  }
  lines.push("");
  lines.push(`${"união".padEnd(labelWidth)}  ${report.unionOperationCount} ops, ${report.unionSchemaCount} schemas`);

  for (const { label, operations } of report.exclusiveOperationsByInstance) {
    lines.push("");
    lines.push(`só em ${label} (${operations.length}):`);
    lines.push(`  ${operations.join(", ")}`);
  }

  for (const { label, schemas } of report.exclusiveSchemasByInstance) {
    lines.push("");
    lines.push(`schemas só em ${label} (${schemas.length}):`);
    lines.push(`  ${schemas.join(", ")}`);
  }

  if (report.divergentProperties.length > 0) {
    lines.push("");
    lines.push(`propriedades divergentes (${report.divergentProperties.length}):`);
    for (const { schema, property, presentIn } of report.divergentProperties) {
      lines.push(`  ${schema}.${property} — só em ${presentIn.join(", ")}`);
    }
  }

  return lines.join("\n");
}
