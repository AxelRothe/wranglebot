import User from "./User.js";
import DB from "../database/DB.js";
import md5 from "md5";

import { v4 as uuidv4 } from "uuid";
import createUserOptions from "./createUserOptions.js";

class AccountManager {
  users: Set<User> = new Set();
  salt = "Wr4ngle_b0t"; //TODO: Salt needs to be stored somewhere else

  async init() {
    try {
      const fetchedUsers = DB().getMany("users", {});

      if (fetchedUsers.length > 0) {
        for (const user of fetchedUsers) {
          await this.addOneUser({
            id: user.id,
            username: user.username,
            password: user.password,
            email: user.email,
            roles: user.roles,
            libraries: user.libraries,
            firstName: user.firstName,
            lastName: user.lastName,
            config: user.config,
            create: false,
          });
        }
      }
    } catch (e) {
      throw e;
    }
  }

  addOneUser(options: createUserOptions) {
    let user = this.getOneUser(options.username);

    if (options.create) {
      if (user) {
        throw new Error("User already exists");
      }

      let p = md5(options.password + this.salt);
      user = new User({
        username: options.username,
        password: p,
        email: options.email,
        roles: options.roles,
        libraries: options.libraries,
        firstName: options.firstName,
        lastName: options.lastName,
        config: options.config,
      });
      DB().updateOne("users", { id: user.id }, user.toJSON({ db: true }));
      this.users.add(user);
    } else {
      if (user) {
        user.update({
          username: options.username,
          password: options.password,
          email: options.email,
          roles: options.roles,
          libraries: options.libraries,
          firstName: options.firstName,
          lastName: options.lastName,
          config: options.config,
        });
      } else {
        user = new User({
          id: options.id,
          username: options.username,
          password: options.password,
          email: options.email,
          roles: options.roles,
          libraries: options.libraries,
          firstName: options.firstName,
          lastName: options.lastName,
          config: options.config,
        });
        this.users.add(user);
      }
    }
    return user;
  }

  updateUserConfig(user: User, config: any) {
    user.setConfig(config);
    DB().updateOne("users", { id: user.id }, user.toJSON({ db: true }));
  }

  removeOneUser(user) {
    const removed = DB().removeOne("users", { id: user.id });
    if (removed) {
      this.users.delete(user);
      return true;
    } else {
      return false;
    }
  }

  getAllUsers(filters = {}): User[] {
    const users = Array.from(this.users);
    let c = {};
    if (Object.keys(filters).length === 0) return users;
    return users.filter((u) => {
      for (let key in filters) {
        if (!c[key]) c[key] = [];
        if (u[key] && u[key] instanceof Array) {
          if (u[key] && u[key].includes(filters[key])) return true;
        } else {
          if (u[key] === filters[key]) return true;
        }
      }
    });
  }

  getOneUser(username): User | undefined {
    return this.getAllUsers().find((u) => u.username === username);
  }

  addRole(user: User, role) {
    if (!user.roles.includes(role)) {
      user.roles.push(role);
      const res = DB().updateOne(
        "users",
        { id: user.id },
        {
          roles: user.roles,
        }
      );
      if (res) return true;
      user.roles.splice(user.roles.indexOf(role), 1); //remove it, if it failed
      return false;
    }
    return false;
  }

  setRoles(user: User, roles) {
    user.roles = roles;
    const res = DB().updateOne(
      "users",
      { id: user.id },
      {
        roles: user.roles,
      }
    );
    return !!res;
  }

  removeRole(user: User, role) {
    if (user.roles.indexOf(role) > -1) {
      user.roles.splice(user.roles.indexOf(role), 1);
      const res = DB().updateOne(
        "users",
        { id: user.id },
        {
          roles: user.roles,
        }
      );
      if (res) return true;
      user.roles.push(role); //put it back, if it failed
      return false;
    }
    return false;
  }

  /**
   * compares the user's roles to the roles passed in
   * if the user has any of the roles, it returns true
   * if the user has none of the roles, it returns false
   *
   * @param user
   * @param roles
   */
  hasRole(user: User, roles) {
    for (const role of roles) {
      if (user.roles.includes(role)) return true;
    }
    return false;
  }

  changePassword(user: User, password) {
    user.password = md5(password + this.salt);
    return DB().updateOne(
      "users",
      { id: user.id },
      {
        password: user.password,
      }
    );
  }

  changeEmail(user: User, email) {
    user.email = email;
    return DB().updateOne(
      "users",
      { id: user.id },
      {
        email: user.email,
      }
    );
  }

  changeFirstName(user: User, firstName) {
    user.firstName = firstName;
    return DB().updateOne(
      "users",
      { id: user.id },
      {
        firstName: user.firstName,
      }
    );
  }

  changeLastName(user: User, lastName) {
    user.lastName = lastName;
    return DB().updateOne(
      "users",
      { id: user.id },
      {
        lastName: user.lastName,
      }
    );
  }

  updateUser(user: User, options) {
    if (options.password) {
      if (options.password.length < 8) throw new Error("Password must be at least 8 characters long");
      //must contain at least one number, one lowercase letter, one uppercase letter, and one special character
      if (options.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/) === null)
        throw new Error("Password must contain at least one number, one lowercase letter, one uppercase letter, and one special character");
    }

    let email = options.email;
    let roles = options.roles;
    let password = options.password ? md5(options.password + this.salt) : undefined;
    let libraries = options.libraries;
    let firstName = options.firstName;
    let lastName = options.lastName;
    let config = options.config;

    const updatedOptions = {
      email,
      roles,
      password,
      libraries,
      firstName,
      lastName,
      config,
    };

    user.update(updatedOptions);
    return DB().updateOne("users", { id: user.id }, updatedOptions);
  }

  allowAccess(user, library) {
    if (!user.libraries.includes(library)) {
      user.libraries.push(library);
      const res = DB().updateOne(
        "users",
        { id: user.id },
        {
          libraries: user.libraries,
        }
      );
      if (res) return true;
      user.libraries.splice(user.libraries.indexOf(library), 1); //remove it, if it failed
      return true;
    }
    return false;
  }

  revokeAccess(user, library) {
    const s = user.libraries.length;
    user.libraries.splice(user.libraries.indexOf(library), 1);
    if (user.libraries.length !== s) {
      const res = DB().updateOne(
        "users",
        { id: user.id },
        {
          libraries: user.libraries,
        }
      );
      if (res) return true;
      user.libraries.push(library); //put it back, if it failed
      return false;
    }
    return false;
  }

  resetPassword(user: User) {
    const password = uuidv4();
    const res = this.changePassword(user, password);
    if (res) return password;
    return false;
  }

  checkAuth(username, password) {
    const user = this.getOneUser(username);
    if (!user) return false;
    return md5(password + this.salt) === user.password;
  }
}
export default new AccountManager();
