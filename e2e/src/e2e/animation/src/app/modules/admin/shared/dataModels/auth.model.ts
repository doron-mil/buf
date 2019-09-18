export interface LoggedInInterface {
  isLogged: boolean;
  data: firebase.UserInfo | null;
}
