import { v4 as uuidv4 } from "uuid";

export default class User {
  id;
  username;
  password;
  firstName;
  lastName;
  email;
  roles: string[] = [];
  libraries = []; //@deprecated

  query: any;
  token: string = "";

  constructor(options) {
    if (!options.username) throw new Error("Username is required");
    if (!options.password) throw new Error("Password is required");

    this.id = options.id || uuidv4();
    this.firstName = options.firstName;
    this.lastName = options.lastName;
    this.username = options.username;
    this.password = options.password;
    this.email = options.email;
    this.roles = options.roles || [];
    this.libraries = options.libraries || []; //@deprecated
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  update(options) {
    this.username = options.username;
    this.password = options.password;
    this.firstName = options.firstName;
    this.lastName = options.lastName;
    this.email = options.email;
    this.roles = options.roles;
    this.libraries = options.libraries;
  }

  toJSON({ db = false }) {
    return {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      password: db ? this.password : undefined,
      email: this.email,
      roles: this.roles,
      libraries: this.libraries, //@deprecated
    };
  }
}
