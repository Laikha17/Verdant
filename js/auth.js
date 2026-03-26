import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, setDoc, doc } from './firebase-config.js';
import { setupNavbar } from './navbar.js';

setupNavbar();

let isLogin = true;

const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-btn');
const toggleText = document.getElementById('toggle-text');
const nameGroup = document.getElementById('name-group');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');

function handleToggle() {
    isLogin = !isLogin;
    
    if (isLogin) {
        authTitle.textContent = "Login to Verdant";
        authBtn.textContent = "Login";
        toggleText.innerHTML = `Don't have an account? <a id="toggle-link" style="color:var(--primary);cursor:pointer;font-weight:600;">Register here</a>`;
        nameGroup.style.display = "none";
        document.getElementById('name').required = false;
    } else {
        authTitle.textContent = "Create an Account";
        authBtn.textContent = "Register";
        toggleText.innerHTML = `Already have an account? <a id="toggle-link" style="color:var(--primary);cursor:pointer;font-weight:600;">Login here</a>`;
        nameGroup.style.display = "block";
        document.getElementById('name').required = true;
    }
    
    document.getElementById('toggle-link').addEventListener('click', handleToggle);
    authError.style.display = "none";
}

document.getElementById('toggle-link').addEventListener('click', handleToggle);

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = "none";
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    
    authBtn.disabled = true;
    
    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = 'index.html';
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Save user to Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            });
            window.location.href = 'index.html';
        }
    } catch (error) {
        authError.textContent = error.message;
        authError.style.display = "block";
    } finally {
        authBtn.disabled = false;
    }
});
