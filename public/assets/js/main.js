"use strict";
import {startAuthentication, startRegistration} from './authservice.js';

let isLoggedIn = false;

switch (window.location.pathname) {
    case "/register/":
        document.getElementById('register-button').addEventListener('click', handleRegistration);
        break;
    case "/login/":
        document.getElementById('login-button').addEventListener('click', handleAuthentication);
        break;
}

async function handleRegistration() {
    const username = document.getElementById('username').value;

    const result = await startRegistration(username);

    if (result.success) {
        window.location.href = "/login";
    } else {
        document.getElementById('status-message').textContent = "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.";
        document.getElementById('status-message').style.display = "block";
    }
}

async function handleAuthentication() {
    const username = document.getElementById('username').value;

    const result = await startAuthentication(username);

    if (result.success) {
        isLoggedIn = true;
        window.location.href = "/dashboard"
    } else {
        isLoggedIn = false;
        document.getElementById('status-message').textContent = "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.";
        document.getElementById('status-message').style.display = "block";
    }
}