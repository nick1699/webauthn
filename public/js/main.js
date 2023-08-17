"use strict";
import { startRegistration } from './authService.js';

document.getElementById('register-button').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    await startRegistration(username);
});
