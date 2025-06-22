import { makeAutoObservable, reaction, runInAction } from "mobx";
import Auth from "../utils/auth";
import { ServerError } from "typings";

export default class CommonStore {
  error: ServerError | null = null;
  token: string | null = new Auth().getToken();
  appLoaded = false;

  alertMessage: string[] = [];
  alertsDisplayed: boolean = false;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.token,
      (token) => {
        if (token) {
          new Auth().setToken(token);
        } else {
          new Auth().clearToken();
        }
      }
    );
  }

  setServerError = (error: ServerError) => {
    this.error = error;
  };

  setToken = (token: string | null) => {
    this.token = token;
  };

  setAppLoaded = () => {
    this.appLoaded = true;
  };

  addAlertMessage = (alert: string) => {
    if (!this.alertMessage) this.alertMessage = [];

    this.alertMessage.push(alert);
  };

  loadScriptByURL = (id: string, url: string, callback: () => void) => {
    const isScriptExist = document.getElementById(id);

    if (!isScriptExist) {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.id = id;
      script.onload = function () {
        if (callback) callback();
      };
      document.body.appendChild(script);
    }

    if (isScriptExist && callback) callback();
  };
}