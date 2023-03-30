export default interface CreateUserOptions {
  create?: boolean;
  id?: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  libraries: string[];
}
