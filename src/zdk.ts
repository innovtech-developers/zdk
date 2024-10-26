import "dotenv/config";

import { ZappyApi } from "./zappy-api";
import { Connection } from "./lib";
import { Contact } from "./lib/contact";
import { Message } from "./lib/message";
import { Queue } from "./lib/queue";
import { Tag } from "./lib/tag";
import { User } from "./lib/user";
import { Ticket } from "./lib/ticket";

export class Zdk extends ZappyApi {
  readonly tickets = new Ticket(this);

  readonly connections = new Connection(this);

  readonly contacts = new Contact(this);

  readonly messages = new Message(this);

  readonly queues = new Queue(this);

  readonly tags = new Tag(this);

  readonly users = new User(this);
}

export default Zdk;
