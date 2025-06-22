import Cookies from "universal-cookie";

export default class Auth {
    private cookie: Cookies;

    constructor(cookie?: Cookies) {
        this.cookie = cookie ?? new Cookies();
    }

    getToken(key: string = 'jwt'): string | null {
        return this.cookie.get(key) || null;
    }

    setToken(value: string, key: string = 'jwt') {
        const expires = new Date();
        expires.setDate(expires.getDate() + 3);
        this.cookie.set(key, value, {
            path: '/',
            expires: expires,
            secure: true,
            sameSite: 'strict',
        });
    }

    clearToken(key: string = 'jwt') {
        this.cookie.remove(key);
    }
}