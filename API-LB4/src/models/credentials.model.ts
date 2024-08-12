export class Credentials {
  constructor(credentials: Credentials) {
    this.username = credentials.username;
    this.password = credentials.password;
  }

  username: string;
  password: string;
}
