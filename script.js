import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where, getDoc, onSnapshot, arrayUnion, enableIndexedDbPersistence, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// TODO: Replace this with your actual Firebase config object from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyApJbB5N4d7dCLayMOxr0S-1iVtPsCTl5E",
  authDomain: "hyper-localservice.firebaseapp.com",
  projectId: "hyper-localservice",
  storageBucket: "hyper-localservice.firebasestorage.app",
  messagingSenderId: "224709799574",
  appId: "1:224709799574:web:8185e245f4dcdbe95fdcb7",
  measurementId: "G-M5T3PVDCWE"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn('Multiple tabs open, offline persistence can only be enabled in one tab at a time.');
      } else if (err.code == 'unimplemented') {
          console.warn('The current browser does not support all of the features required to enable persistence');
      }
  });
const auth = getAuth(app);

// Elements
const splashScreen = document.getElementById('splash-screen');
const loginPage = document.getElementById('login-page');
const customerRegisterPage = document.getElementById('customer-register-page');
const mainApp = document.getElementById('main-app');
const logoutBtn = document.getElementById('logout-btn');
    
    const btnRegisterCustomer = document.getElementById('btn-register-customer');
    const btnBackToLogin = document.getElementById('back-to-login');

    // Splash screen logic
    // Hide splash screen after 2.5 seconds and show login page
    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        
        setTimeout(() => {
            splashScreen.style.display = 'none';
            loginPage.classList.remove('hidden');
        }, 800); // Wait for the fade-out transition to finish
    }, 2500);

    // Reusable function for password visibility toggle
    const setupPasswordToggle = (toggleBtnId, inputId) => {
        const toggleBtn = document.getElementById(toggleBtnId);
        const input = document.getElementById(inputId);
        if (!toggleBtn || !input) return;

        toggleBtn.addEventListener('click', function () {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            this.classList.toggle('fa-eye-slash');
            this.classList.toggle('fa-eye');
            
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    };

    // Setup password toggles
    setupPasswordToggle('toggle-password', 'password');
    setupPasswordToggle('toggle-reg-password', 'reg-password');
    setupPasswordToggle('toggle-worker-reg-password', 'worker-reg-password');

    // Navigation logic: Login -> Register
    btnRegisterCustomer.addEventListener('click', (e) => {
        e.preventDefault();
        loginPage.classList.add('hidden');
        setTimeout(() => {
            loginPage.style.display = 'none';
            customerRegisterPage.style.display = 'flex';
            setTimeout(() => {
                customerRegisterPage.classList.remove('hidden');
            }, 50);
        }, 800); // matches CSS transition time
    });

    // Navigation logic: Register -> Login
    btnBackToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        customerRegisterPage.classList.add('hidden');
        setTimeout(() => {
            customerRegisterPage.style.display = 'none';
            loginPage.style.display = 'flex';
            setTimeout(() => {
                loginPage.classList.remove('hidden');
            }, 50);
        }, 800);
    });

    // Worker Navigation logic
    const btnRegisterWorker = document.getElementById('btn-register-worker');
    const workerRegisterPage = document.getElementById('worker-register-page');
    const btnBackToLoginWorker = document.getElementById('back-to-login-worker');

    if (btnRegisterWorker) {
        btnRegisterWorker.addEventListener('click', (e) => {
            e.preventDefault();
            loginPage.classList.add('hidden');
            setTimeout(() => {
                loginPage.style.display = 'none';
                workerRegisterPage.style.display = 'flex';
                setTimeout(() => {
                    workerRegisterPage.classList.remove('hidden');
                }, 50);
            }, 800);
        });
    }

    if (btnBackToLoginWorker) {
        btnBackToLoginWorker.addEventListener('click', (e) => {
            e.preventDefault();
            workerRegisterPage.classList.add('hidden');
            setTimeout(() => {
                workerRegisterPage.style.display = 'none';
                loginPage.style.display = 'flex';
                setTimeout(() => {
                    loginPage.classList.remove('hidden');
                }, 50);
            }, 800);
        });
    }

    // Forgot Password Navigation logic
    const btnForgotPasswordLink = document.getElementById('forgot-password-link');
    const forgotPasswordPage = document.getElementById('forgot-password-page');
    const btnBackToLoginForgot = document.getElementById('back-to-login-forgot');
    
    if (btnForgotPasswordLink) {
        btnForgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginPage.classList.add('hidden');
            setTimeout(() => {
                loginPage.style.display = 'none';
                forgotPasswordPage.style.display = 'flex';
                setTimeout(() => {
                    forgotPasswordPage.classList.remove('hidden');
                }, 50);
            }, 800);
        });
    }

    if (btnBackToLoginForgot) {
        btnBackToLoginForgot.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordPage.classList.add('hidden');
            setTimeout(() => {
                forgotPasswordPage.style.display = 'none';
                loginPage.style.display = 'flex';
                setTimeout(() => {
                    loginPage.classList.remove('hidden');
                }, 50);
            }, 800);
        });
    }

    // Forgot Password Submission Logic
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = forgotPasswordForm.querySelector('.login-btn');
            const originalText = btn.textContent;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
            btn.style.opacity = '0.8';

            const email = document.getElementById('forgot-email').value;

            try {
                await sendPasswordResetEmail(auth, email);
                btn.innerHTML = 'Email Sent!';
                btn.style.backgroundColor = 'var(--accent-green)';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.opacity = '1';
                    forgotPasswordForm.reset();
                    // Go back to login
                    btnBackToLoginForgot.click();
                }, 2000);
            } catch (error) {
                console.error("Forgot Password Error:", error);
                alert("Error sending password reset email: " + error.message);
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
            }
        });
    }

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('main-login-btn');
        const originalText = btn.textContent;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Checking...';
        btn.style.opacity = '0.8';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Check for Admin
            if (email === 'admin@gmail.com' && password === 'admin123') {
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                } catch(e) {
                    // Create admin account if it doesn't exist
                    await createUserWithEmailAndPassword(auth, email, password);
                }
                window.selectedSessionRole = 'admin'; localStorage.setItem('selectedSessionRole', 'admin');
                btn.innerHTML = 'Success!';
                return;
            }

            // Check Firestore BEFORE signing in to validate role
            const emailQ = query(collection(db, "customers"), where("email", "==", email));
            const emailSnap = await getDocs(emailQ);

            if (!emailSnap.empty) {
                const userData = emailSnap.docs[0].data();

                const actualRole = userData.role;
                
                // Show role popup on the login page BEFORE logging in for EVERYONE
                btn.innerHTML = originalText;
                btn.style.opacity = '1';

                                const roleModal = document.getElementById('role-selection-modal');
                roleModal.classList.remove('hidden');
                roleModal.style.display = 'flex';

                // Wait for the user to pick a role
                const selectedRole = await new Promise((resolve) => {
                    document.getElementById('btn-login-customer').onclick = () => {
                        roleModal.classList.add('hidden');
                        roleModal.style.display = 'none';
                        resolve('customer');
                    };
                    document.getElementById('btn-login-worker').onclick = () => {
                        roleModal.classList.add('hidden');
                        roleModal.style.display = 'none';
                        resolve('worker');
                    };
                });
                
                if (window.cancelChatDeletion) window.cancelChatDeletion(userData.uid, 'system');

                if (actualRole !== 'both' && actualRole !== selectedRole) {
                    alert(`Your email is not registered as a ${selectedRole}. Please log in as a ${actualRole}.`);
                    return;
                }
                
                // Store the selected role so we render the correct dashboard
                window.selectedSessionRole = selectedRole;
            }

            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Logging in...';
            await signInWithEmailAndPassword(auth, email, password);
            btn.innerHTML = 'Success!';
        } catch (error) {
            console.error(error);
            let errorMessage = error.message;
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                errorMessage = "Incorrect email/password. If your account was deleted, you must create a new account by clicking 'Register' below.";
            }
            alert("Login failed: " + errorMessage);
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
        }
    });

    // Logout functionality (now on profile screen and home dropdown)
    const handleLogout = async () => {
        try {
            await signOut(auth);
            loginForm.reset();
        } catch (error) {
            console.error("Logout error", error);
        }
    };
    
    logoutBtn.addEventListener('click', handleLogout);

    // Chat auto-deletion helpers
    window.scheduleChatDeletion = async (uid1, uid2) => {
        if (!uid1 || !uid2) return;
        try {
            const chatDocId = uid1 < uid2 ? `chat_${uid1}_${uid2}` : `chat_${uid2}_${uid1}`;
            await updateDoc(doc(db, "chats", chatDocId), { expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
        } catch (e) {}
    };
    window.cancelChatDeletion = async (uid1, uid2) => {
        if (!uid1 || !uid2) return;
        try {
            const chatDocId = uid1 < uid2 ? `chat_${uid1}_${uid2}` : `chat_${uid2}_${uid1}`;
            await updateDoc(doc(db, "chats", chatDocId), { expiresAt: null });
        } catch (e) {}
    };

    // Home Header Menu Logic
    const homeMenuBtn = document.getElementById('home-menu-btn');
    const homeDropdownMenu = document.getElementById('home-dropdown-menu');
    const homeLogoutBtn = document.getElementById('home-logout-btn');

    if (homeMenuBtn && homeDropdownMenu) {
        homeMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = homeDropdownMenu.style.display === 'none';
            homeDropdownMenu.style.display = isHidden ? 'block' : 'none';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            homeDropdownMenu.style.display = 'none';
        });
    }

    if (homeLogoutBtn) {
        homeLogoutBtn.addEventListener('click', handleLogout);
    }

    const homeReleaseBtn = document.getElementById('home-release-worker-btn');
    if (homeReleaseBtn) {
        homeReleaseBtn.addEventListener('click', async () => {
            if (!auth.currentUser) return;
            if (confirm("Are you sure you want to mark all your active jobs as completed? This will release you to be booked by other customers.")) {
                try {
                    const workerId = auth.currentUser.uid;
                    const bQuery = query(collection(db, "bookings"), where("workerId", "==", workerId));
                    const bSnap = await getDocs(bQuery);
                    let updatedCount = 0;
                    
                    const updatePromises = [];
                    bSnap.forEach((bDoc) => {
                        const status = bDoc.data().status;
                        if (['Pending', 'Accepted', 'Reached', 'PaymentPending'].includes(status)) {
                            updatePromises.push(
                                updateDoc(doc(db, "bookings", bDoc.id), { status: 'Completed' }).then(() => {
                                    addNotification(bDoc.data().userId, "Your worker has marked the job as Completed.");
                                    if (window.scheduleChatDeletion) window.scheduleChatDeletion(bDoc.data().userId, bDoc.data().workerId);
                                })
                            );
                            updatedCount++;
                        }
                    });
                    
                    await Promise.all(updatePromises);
                    
                    alert(`Successfully completed ${updatedCount} active job(s). You are now available for booking!`);
                    
                } catch(e) {
                    console.error("Failed to release worker:", e);
                    alert("Error releasing worker. See console.");
                }
            }
        });
    }

    // Handle Bottom Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', async () => {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            if (targetId === 'view-bookings' && auth.currentUser) {
                fetchBookings(auth.currentUser.uid);
            }
            if (targetId === 'view-history' && auth.currentUser) {
                fetchHistory(auth.currentUser.uid);
            }
            if (targetId === 'view-notifications' && auth.currentUser) {
                fetchNotifications(auth.currentUser.uid);
            }
            // Admin view fetching
            
            if (targetId === 'view-admin-orders') {
                fetchAdminOrders();
            }
            if (targetId === 'view-admin-customers') {
                fetchAdminCustomers();
            }
            if (targetId === 'view-admin-workers') {
                fetchAdminWorkers();
            }

            // Show FAB only on Admin Home tab if logged in as Admin
            const adminFab = document.getElementById('admin-fab-btn');
            if (adminFab && (window.selectedSessionRole || localStorage.getItem('selectedSessionRole')) === 'admin') {
                if (targetId === 'view-admin-home') {
                    adminFab.style.display = 'flex';
                } else {
                    adminFab.style.display = 'none';
                }
            }

            // Refresh profile data every time profile tab is clicked
            if (targetId === 'view-profile' && auth.currentUser) {
                if ((window.selectedSessionRole || localStorage.getItem('selectedSessionRole')) === 'admin') {
                    // Populate hardcoded admin profile
                    document.getElementById('profile-name-display').textContent = 'User: admin';
                    document.getElementById('profile-email-display').textContent = 'admin@gmail.com';
                    document.getElementById('profile-phone-display').textContent = '9848663831';
                    document.getElementById('profile-location-display').textContent = '';
                    document.getElementById('profile-role-display').textContent = 'Admin';
                    document.getElementById('profile-service-row').style.display = 'none';
                    const regWorkerBtn = document.getElementById('register-worker-btn');
                    if (regWorkerBtn) regWorkerBtn.style.display = 'none';
                    
                    // Default avatar
                    document.getElementById('profile-avatar-img').style.display = 'block';
                    document.getElementById('profile-avatar-icon-default').style.display = 'none';
                    document.getElementById('avatar-edit-btn').style.display = 'flex';
                    
                    try {
                        await setDoc(doc(db, "config", "adminProfile"), { uid: user.uid }, { merge: true });
                        const adminProfileDoc = await getDoc(doc(db, "config", "adminProfile"));
                        if (adminProfileDoc.exists() && adminProfileDoc.data().profileImage) {
                            document.getElementById('profile-avatar-img').src = adminProfileDoc.data().profileImage;
                        } else {
                            document.getElementById('profile-avatar-img').src = 'https://via.placeholder.com/150?text=Admin';
                        }
                    } catch(e) {
                        document.getElementById('profile-avatar-img').src = 'https://via.placeholder.com/150?text=Admin';
                    }
                } else {
                    document.getElementById('avatar-edit-btn').style.display = 'flex'; // show for workers/customers
                    fetchAndPopulateProfile(auth.currentUser);
                }
            }
        });
    });

    // Profile back button  go to Home
    const profileBackBtn = document.getElementById('profile-back-btn');
    if (profileBackBtn) {
        profileBackBtn.addEventListener('click', () => {
            document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
            document.getElementById('view-home').classList.add('active');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            const homeNav = document.querySelector('.nav-item[data-target="view-home"]');
            if (homeNav) homeNav.classList.add('active');
        });
    }

    // Helper: fetch Firestore user data and populate profile fields
    async function fetchAndPopulateProfile(user) {
        try {
            const q = query(collection(db, "customers"), where("uid", "==", user.uid));
            const snap = await getDocs(q);
            if (snap.empty) return;
            const d = snap.docs[0].data();

            const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || ''; };
            setTxt('profile-name-display',     d.name);
            setTxt('profile-email-display',    d.email || user.email);
            setTxt('profile-location-display', d.location);
            setTxt('profile-phone-display',    d.phone);

            const displayRole = window.selectedSessionRole || d.role;
            const roleEl = document.getElementById('profile-role-display');
            if (roleEl) {
                if (displayRole === 'worker') roleEl.textContent = ' Worker';
                else roleEl.textContent = ' Customer';
            }
            
            // Set avatar if exists
            const avatarImg = document.getElementById('profile-avatar-img');
            const avatarIcon = document.getElementById('profile-avatar-icon-default');
            if (avatarImg && avatarIcon) {
                if (d.profileImage) {
                    avatarImg.src = d.profileImage;
                    avatarImg.style.display = 'block';
                    avatarIcon.style.display = 'none';
                } else {
                    avatarImg.style.display = 'none';
                    avatarIcon.style.display = 'block';
                }
            }

            const svcRow = document.getElementById('profile-service-row');
            const svcEl  = document.getElementById('profile-service-display');
            if (svcRow && svcEl) {
                if (d.service && displayRole === 'worker') {
                    svcEl.textContent = d.service;
                    svcRow.style.display = 'flex';
                } else {
                    svcRow.style.display = 'none';
                }
            }
        } catch(e) { console.error('Profile fetch error:', e); }
    }

    // Auth State Listener (Auto-login / Auto-logout routing)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            loginPage.style.display = 'none';
            loginPage.classList.add('hidden');
            customerRegisterPage.style.display = 'none';
            customerRegisterPage.classList.add('hidden');
            
            const workerRegPage = document.getElementById('worker-register-page');
            if (workerRegPage) {
                workerRegPage.style.display = 'none';
                workerRegPage.classList.add('hidden');
            }
            
            // Show main app (dashboard)
            mainApp.style.display = 'flex';
            setTimeout(() => mainApp.classList.remove('hidden'), 50);

            // Fetch user profile data from Firestore
            try {
                // Real-time listener for block status
                if (window.blockListener) {
                    window.blockListener();
                }
                const blockQ = query(collection(db, "customers"), where("uid", "==", user.uid));
                window.blockListener = onSnapshot(blockQ, (snap) => {
                    if (!snap.empty) {
                        const data = snap.docs[0].data();
                        const overlay = document.getElementById('worker-blocked-overlay');
                        if (overlay) {
                            const currentViewRole = window.selectedSessionRole || data.role;
                            if (currentViewRole === 'worker' && data.status === 'blocked') {
                                overlay.style.display = 'flex';
                            } else {
                                overlay.style.display = 'none';
                            }
                        }
                    }
                });

                const q = query(collection(db, "customers"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
                    document.getElementById('profile-name-display').textContent = userData.name || 'User';
                    document.getElementById('profile-email-display').textContent = userData.email || user.email;
                    document.getElementById('profile-location-display').textContent = userData.location || 'Unknown Location';

                    // Phone
                    const phoneEl = document.getElementById('profile-phone-display');
                    if (phoneEl) phoneEl.textContent = userData.phone || 'Not provided';

                    // Determine which role we are currently viewing the app as
                    const currentViewRole = window.selectedSessionRole || userData.role;

                    // Role badge
                    const roleEl = document.getElementById('profile-role-display');
                    if (roleEl) {
                        if (currentViewRole === 'worker') {
                            roleEl.textContent = ' Worker';
                        } else {
                            roleEl.textContent = ' Customer';
                        }
                    }

                    // Service specialization (workers only)
                    const serviceRow = document.getElementById('profile-service-row');
                    const serviceEl = document.getElementById('profile-service-display');
                    if (serviceRow && serviceEl) {
                        if (currentViewRole === 'worker' && userData.service) {
                            serviceEl.textContent = userData.service;
                            serviceRow.style.display = 'flex';
                        } else {
                            serviceRow.style.display = 'none';
                        }
                    }

                    const homeLocDisplay = document.getElementById('home-location-display');
                    if (homeLocDisplay) {
                        homeLocDisplay.textContent = userData.searchLocation || userData.location || 'Unknown Location';
                    }
                    
                    // Handle Roles: Worker vs Customer Dashboard
                    if (userData.role === 'both' && !window.selectedSessionRole) {
                        // Show modal and wait for choice
                        const roleModal = document.getElementById('role-selection-modal');
                        if (roleModal) {
                            roleModal.style.display = 'flex';
                            roleModal.classList.remove('hidden');
                            
                            mainApp.style.display = 'none'; // hide until selection
                            
                            document.getElementById('btn-login-customer').onclick = () => {
                                window.selectedSessionRole = 'customer'; localStorage.setItem('selectedSessionRole', 'customer');
                                roleModal.classList.add('hidden');
                                setTimeout(() => roleModal.style.display = 'none', 300);
                                mainApp.style.display = 'flex';
                                renderDashboard('customer', userData.location);
                            };
                            
                            document.getElementById('btn-login-worker').onclick = () => {
                                window.selectedSessionRole = 'worker'; localStorage.setItem('selectedSessionRole', 'worker');
                                roleModal.classList.add('hidden');
                                setTimeout(() => roleModal.style.display = 'none', 300);
                                mainApp.style.display = 'flex';
                                renderDashboard('worker', userData.location);
                            };
                        }
                    } else {
                        const roleToRender = window.selectedSessionRole || userData.role;
                        window.selectedSessionRole = roleToRender; localStorage.setItem('selectedSessionRole', roleToRender);
                        renderDashboard(roleToRender, userData.location);
                    }
                } else {
                    document.getElementById('profile-name-display').textContent = 'User';
                    document.getElementById('profile-email-display').textContent = user.email;
                    
                    const homeLocDisplay = document.getElementById('home-location-display');
                    if (homeLocDisplay) {
                        homeLocDisplay.textContent = 'Unknown Location';
                    }
                    if (window.selectedSessionRole === 'admin') {
                        renderDashboard('admin', 'Unknown Location');
                    } else {
                        renderDashboard(window.selectedSessionRole || 'customer', 'Unknown Location');
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        } else {
            const normalNav = document.getElementById('normal-bottom-nav');
            const adminNav = document.getElementById('admin-bottom-nav');
            const adminFab = document.getElementById('admin-fab-btn');
            if (normalNav) normalNav.style.display = 'none';
            if (adminNav) adminNav.style.display = 'none';
            if (adminFab) adminFab.style.display = 'none';
            
            window.selectedSessionRole = localStorage.getItem('selectedSessionRole'); localStorage.removeItem('selectedSessionRole');
            // User is logged out, ensure Main App is hidden
            if (mainApp.style.display !== 'none') {
                mainApp.classList.add('hidden');
                setTimeout(() => {
                    mainApp.style.display = 'none';
                    loginPage.style.display = 'flex';
                    setTimeout(() => loginPage.classList.remove('hidden'), 50);
                }, 800);
            } else {
                loginPage.style.display = 'flex';
                loginPage.classList.remove('hidden');
            }
        }
    });

    //  Customer Registration with inline OTP 
    let customerOtpSent = false;
    let customerGeneratedOtp = null;

    const registerForm = document.getElementById('customer-register-form');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = registerForm.querySelector('.login-btn');
        const originalText = 'Register';

        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const location = document.getElementById('reg-location').value;
        const password = document.getElementById('reg-password').value;
        const otpGroup = document.getElementById('customer-otp-group');
        const otpInput = document.getElementById('customer-otp-input');

        if (!email || !password) { alert("Please enter email and password."); return; }

        if (!customerOtpSent) {
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending OTP...';
            btn.disabled = true; btn.style.opacity = '0.8';
            customerGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const sent = await sendOTP(email, customerGeneratedOtp);
            if (sent) {
                customerOtpSent = true;
                otpGroup.style.display = 'block';
                btn.innerHTML = 'Verify & Register';
            } else {
                alert("Failed to send OTP. Is the local backend server running on port 3001?");
                btn.innerHTML = originalText;
            }
            btn.disabled = false; btn.style.opacity = '1';
        } else {
            const enteredOtp = otpInput.value.trim();
            if (enteredOtp !== customerGeneratedOtp) { alert("Invalid OTP. Please try again."); return; }
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...';
            btn.disabled = true;
            await finalizeRegistration({ type: 'customer', name, email, phone, location, password, btn, originalText, form: registerForm });
            customerOtpSent = false; otpGroup.style.display = 'none'; otpInput.value = '';
        }
    });

    //  Worker Registration with inline OTP 
    let workerOtpSent = false;
    let workerGeneratedOtp = null;

    const workerRegisterForm = document.getElementById('worker-register-form');
    if (workerRegisterForm) {
        workerRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = workerRegisterForm.querySelector('.login-btn');
            const originalText = 'Register as Worker';

            const name = document.getElementById('worker-reg-name').value;
            const email = document.getElementById('worker-reg-email').value;
            const phone = document.getElementById('worker-reg-phone').value;
            const location = document.getElementById('worker-reg-location').value;
            const service = document.getElementById('worker-reg-service').value;
            const password = document.getElementById('worker-reg-password').value;
            const otpGroup = document.getElementById('worker-otp-group');
            const otpInput = document.getElementById('worker-otp-input');

            if (!email || !password) return;

            if (!workerOtpSent) {
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending OTP...';
                btn.disabled = true; btn.style.opacity = '0.8';
                workerGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
                const sent = await sendOTP(email, workerGeneratedOtp);
                if (sent) {
                    workerOtpSent = true;
                    otpGroup.style.display = 'block';
                    btn.innerHTML = 'Verify & Register';
                } else {
                    alert("Failed to send OTP. Is the local backend server running on port 3001?");
                    btn.innerHTML = originalText;
                }
                btn.disabled = false; btn.style.opacity = '1';
            } else {
                const enteredOtp = otpInput.value.trim();
                if (enteredOtp !== workerGeneratedOtp) { alert("Invalid OTP. Please try again."); return; }
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...';
                btn.disabled = true;
                await finalizeRegistration({ type: 'worker', name, email, phone, location, service, password, btn, originalText, form: workerRegisterForm });
                workerOtpSent = false; otpGroup.style.display = 'none'; otpInput.value = '';
            }
        });
    }

    //  sendOTP helper 
    async function sendOTP(email, otp) {
        try {
            const response = await fetch('http://localhost:3001/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await response.json();
            if (data.simulated) console.log("OTP simulated:", data.otp);
            return data.success;
        } catch (error) {
            console.error("Failed to send OTP:", error);
            return false;
        }
    }

    //  finalizeRegistration 
    async function finalizeRegistration({ type, name, email, phone, location, service, password, btn, originalText, form }) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const docData = { uid: user.uid, name, email, phone, location, role: type, timestamp: new Date() };
            if (type === 'worker') docData.service = service;
            await addDoc(collection(db, "customers"), docData);
            btn.innerHTML = 'Success!';
            btn.style.backgroundColor = 'var(--accent-green)';
            setTimeout(() => { form.reset(); btn.innerHTML = originalText; btn.style.backgroundColor = ''; btn.disabled = false; }, 1500);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                try {
                    const uc = await signInWithEmailAndPassword(auth, email, password);
                    const q = query(collection(db, "customers"), where("uid", "==", uc.user.uid));
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        const docRef = snap.docs[0].ref;
                        const ud = snap.docs[0].data();
                        if (type === 'customer' && ud.role === 'worker') { await updateDoc(docRef, { role: 'both' }); btn.innerHTML = 'Added Customer Role!'; }
                        else if (type === 'worker' && ud.role === 'customer') { await updateDoc(docRef, { role: 'both', service, phone, location }); btn.innerHTML = 'Added Worker Role!'; }
                        else btn.innerHTML = 'Already registered!';
                        btn.style.backgroundColor = 'var(--accent-green)';
                        setTimeout(() => { form.reset(); btn.innerHTML = originalText; btn.style.backgroundColor = ''; btn.disabled = false; }, 1500);
                        return;
                    }
                } catch (e) { alert("Email already registered. Please enter your correct password."); }
            } else { alert("Error: " + error.message); }
            btn.innerHTML = originalText; btn.disabled = false;
        }
    }

    // --- Location Picker Logic ---
    const lpModal = document.getElementById('location-picker-modal');
    const closeLpBtn = document.getElementById('close-location-picker');
    const lpSearchInput = document.getElementById('lp-search-input');
    const lpOtherList = document.getElementById('lp-other-list');
    const homeLocationContainer = document.querySelector('.home-delivery-info'); // Clickable area on home page
    const lpCurrentCity = document.getElementById('lp-current-city');

    const indianCities = [
        "Aalo", "Abohar", "Abu Road", "Achampet", "Acharapakkam", "Addanki", "Agra", "Ahmedabad", "Ajmer", 
        "Aligarh", "Ambala", "Amritsar", "Aurangabad", "Bengaluru", "Bhopal", "Bhubaneswar", "Bikaner", 
        "Chandigarh", "Chennai", "Coimbatore", "Dehradun", "Delhi", "Delhi-NCR", "Dhanbad", "Faridabad", 
        "Gandhinagar", "Ghaziabad", "Guwahati", "Gwalior", "Hyderabad", "Indore", "Jabalpur", "Jaipur", 
        "Jalandhar", "Jammu", "Jamshedpur", "Jodhpur", "Kanpur", "Kochi", "Kolkata", "Kota", "Kozhikode", 
        "Lucknow", "Ludhiana", "Madanapalle", "Madurai", "Mangalore", "Meerut", "Moradabad", "Mumbai", 
        "Mysore", "Nagpur", "Nashik", "Noida", "Patna", "Pune", "Raipur", "Rajkot", "Ranchi", "Rourkela", 
        "Salem", "Siliguri", "Srinagar", "Surat", "Thiruvananthapuram", "Tiruchirappalli", "Udaipur", 
        "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam", "Warangal"
    ];

    // Populate "Other Cities" list
    const renderCities = (citiesToRender, searchQuery = "") => {
        lpOtherList.innerHTML = '';
        
        citiesToRender.forEach(city => {
            const div = document.createElement('div');
            div.className = 'lp-city-item';
            div.textContent = city;
            div.addEventListener('click', () => selectCity(city));
            lpOtherList.appendChild(div);
        });

        // Always allow adding a custom location if there's a search query
        if (searchQuery.trim() !== "") {
            const addDiv = document.createElement('div');
            addDiv.className = 'lp-city-item';
            addDiv.style.borderTop = "1px solid #eee";
            addDiv.style.color = "var(--primary-color)";
            addDiv.innerHTML = `<i class="fa-solid fa-plus"></i> <strong>Add custom location:</strong> ${searchQuery}`;
            addDiv.addEventListener('click', () => selectCity(searchQuery));
            lpOtherList.appendChild(addDiv);
        } else if (citiesToRender.length === 0) {
            lpOtherList.innerHTML = '<div class="lp-city-item" style="color: #999;">Type to search for your village/city...</div>';
        }
    };

    renderCities(indianCities);

    let searchTimeout;
    // Filter cities on search & Call API
    if (lpSearchInput) {
        lpSearchInput.addEventListener('input', (e) => {
            const queryText = e.target.value.toLowerCase().trim();
            
            // Clear previous timeout
            clearTimeout(searchTimeout);

            if (queryText === "") {
                renderCities(indianCities, "");
                return;
            }

            // Local filter first (instant)
            const localFiltered = indianCities.filter(city => city.toLowerCase().includes(queryText));
            renderCities(localFiltered, queryText);

            // API search for deeper locations (debounced to avoid rate limiting)
            if (queryText.length >= 3) {
                searchTimeout = setTimeout(async () => {
                    try {
                        // Using OpenStreetMap Nominatim API for India
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryText)}&countrycodes=in&format=json&limit=5`, {
                            headers: {
                                'Accept-Language': 'en'
                            }
                        });
                        const data = await response.json();
                        
                        if (data && data.length > 0) {
                            // Map results to display names (taking the first few parts for cleanliness)
                            const apiResults = data.map(item => {
                                const parts = item.display_name.split(',');
                                // Usually format is: Village, District, State, Pincode, India
                                // We'll take up to the first 3 parts
                                return parts.slice(0, 3).join(',').trim();
                            });
                            
                            // Combine local and API results, removing exact duplicates
                            const combined = [...new Set([...localFiltered, ...apiResults])];
                            renderCities(combined, queryText);
                        }
                    } catch (err) {
                        console.error("Location search API error:", err);
                    }
                }, 600); // 600ms debounce
            }
        });
    }

    // Open Modal
    if (homeLocationContainer) {
        homeLocationContainer.addEventListener('click', () => {
            lpModal.classList.remove('hidden');
            setTimeout(() => lpModal.classList.add('open'), 10); // Trigger transition
            
            const currentLoc = document.getElementById('home-location-display')?.textContent || 'Select City';
            if (lpCurrentCity) lpCurrentCity.textContent = currentLoc;
        });
    }

    // Close Modal
    if (closeLpBtn) {
        closeLpBtn.addEventListener('click', () => {
            lpModal.classList.remove('open');
            setTimeout(() => lpModal.classList.add('hidden'), 300); // Wait for transition
        });
    }

    // Handle Popular City Clicks
    document.querySelectorAll('.lp-popular-item').forEach(item => {
        item.addEventListener('click', () => {
            const city = item.getAttribute('data-city');
            selectCity(city);
        });
    });

    // Auto Detect
    const autoDetectBtn = document.getElementById('lp-auto-detect-btn');
    if (autoDetectBtn) {
        autoDetectBtn.addEventListener('click', () => {
            const originalHTML = autoDetectBtn.innerHTML;
            autoDetectBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Detecting...';
            autoDetectBtn.disabled = true;

            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser");
                autoDetectBtn.innerHTML = originalHTML;
                autoDetectBtn.disabled = false;
                return;
            }

            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    // Reverse geocode using Nominatim
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                    const data = await response.json();
                    
                    if (data && data.address) {
                        // Extract the most relevant city/village name
                        const cityOrVillage = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state_district || "Unknown Location";
                        selectCity(cityOrVillage);
                    } else {
                        alert("Could not determine your location name.");
                    }
                } catch (error) {
                    console.error("Error reverse geocoding:", error);
                    alert("Error detecting location.");
                } finally {
                    autoDetectBtn.innerHTML = originalHTML;
                    autoDetectBtn.disabled = false;
                }
            }, (error) => {
                console.error("Geolocation error:", error);
                alert("Location access denied or unavailable.");
                autoDetectBtn.innerHTML = originalHTML;
                autoDetectBtn.disabled = false;
            });
        });
    }

    // Select City Function
    async function selectCity(city) {
        // Update UI immediately
        const homeDisplay = document.getElementById('home-location-display');
        
        if (homeDisplay) homeDisplay.textContent = city;
        
        // Close modal
        lpModal.classList.remove('open');
        setTimeout(() => lpModal.classList.add('hidden'), 300);
        
        // Update Firestore
        const user = auth.currentUser;
        if (user) {
            try {
                const q = query(collection(db, "customers"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docRef = querySnapshot.docs[0].ref;
                    const userData = querySnapshot.docs[0].data();
                    
                    if (userData.role === 'customer') {
                        await updateDoc(docRef, { location: city, searchLocation: city });
                        const profileDisplay = document.getElementById('profile-location-display');
                        if (profileDisplay) profileDisplay.textContent = city;
                    } else {
                        // For workers or 'both', NEVER change their registered location.
                        // Only change their searchLocation so they can browse other cities as a customer.
                        await updateDoc(docRef, { searchLocation: city });
                    }
                }
            } catch (error) {
                console.error("Error updating location:", error);
            }
        }

        // Update the global location variable immediately
        currentCustomerLocation = city;
        window.currentCustomerLocation = city;

        // Fetch new workers for this city
        if (window.fetchWorkersByLocation) {
            window.fetchWorkersByLocation(city);
        }

        // If service workers section is already open, refresh it for the new location
        const workersSec = document.getElementById('service-workers-section');
        const workerTitle = document.getElementById('service-workers-title');
        if (workersSec && workersSec.style.display !== 'none' && workerTitle) {
            const titleText = workerTitle.textContent;
            const serviceMatch = titleText.match(/^(.+?) Workers/);
            const currentService = serviceMatch ? serviceMatch[1].trim() : '';
            if (currentService && window.fetchWorkersByService) {
                workerTitle.textContent = currentService + ' Workers in ' + city;
                window.fetchWorkersByService(city, currentService);
            }
        }
    }


    // Store current location for service filtering
    let currentCustomerLocation = 'Unknown Location';

    // Role-based Rendering
    function renderDashboard(role, location) {
        const customerServices = document.getElementById('customer-services-container');
        const workerDashboard = document.getElementById('worker-dashboard-container');
        const releaseBtn = document.getElementById('home-release-worker-btn');
        
        const normalNav = document.getElementById('normal-bottom-nav');
        const adminNav = document.getElementById('admin-bottom-nav');
        const adminFab = document.getElementById('admin-fab-btn');
        if (role === 'admin') {
            document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
            const adminHome = document.getElementById('view-admin-home');
            if (adminHome) adminHome.classList.add('active');
            if (normalNav) { normalNav.style.display = 'none'; normalNav.classList.add('hidden'); }
            if (adminNav) { adminNav.style.display = 'flex'; adminNav.classList.remove('hidden'); }
            if (adminFab) {
                adminFab.style.display = 'flex';
                adminFab.style.alignItems = 'center';
                adminFab.style.justifyContent = 'center';
                adminFab.onclick = () => { const m = document.getElementById('add-service-modal'); if(m) m.style.display='flex'; };
            }
            if (customerServices) customerServices.style.display = 'none';
            if (workerDashboard) workerDashboard.style.display = 'none';
            const lhBtn2 = document.getElementById('home-leave-history-btn');
            if (lhBtn2) lhBtn2.style.display = 'none';
            if (typeof fetchAdminDashboard !== "undefined") { fetchAdminDashboard(); } else if (window.fetchAdminDashboard) { window.fetchAdminDashboard(); }
            return;
        } else {
            if (normalNav) { normalNav.style.display = 'flex'; normalNav.classList.remove('hidden'); }
            if (adminNav) { adminNav.style.display = 'none'; adminNav.classList.add('hidden'); }
            if (adminFab) { adminFab.style.display = 'none'; }
        }
        if (role === 'worker') {
            if (customerServices) customerServices.style.display = 'none';
            if (workerDashboard) workerDashboard.style.display = 'block';
            const lhBtn = document.getElementById('home-leave-history-btn');
            if (lhBtn) lhBtn.style.display = 'block';
            if (releaseBtn) releaseBtn.style.display = 'flex';
            const profNotif = document.getElementById('profile-notification-item');
            if (profNotif) profNotif.style.display = 'none';
            const navNotif = document.getElementById('nav-notification-item');
            if (navNotif) navNotif.style.display = 'none';
            if (auth.currentUser) {
                fetchAndPopulateWorkerLeave(auth.currentUser.uid);
                fetchAndPopulateWorkerLeave(auth.currentUser.uid);
            }
        } else {
            if (customerServices) customerServices.style.display = 'block';
            if (workerDashboard) workerDashboard.style.display = 'none';
            if (releaseBtn) releaseBtn.style.display = 'none';
            const lhBtn3 = document.getElementById('home-leave-history-btn');
            if (lhBtn3) lhBtn3.style.display = 'none';
            const profNotif2 = document.getElementById('profile-notification-item');
            if (profNotif2) profNotif2.style.display = 'flex';
            const navNotif2 = document.getElementById('nav-notification-item');
            if (navNotif2) navNotif2.style.display = 'flex';
            currentCustomerLocation = location || 'Unknown Location';
            window.currentCustomerLocation = currentCustomerLocation;


            // Wire up service category tile clicks
            document.querySelectorAll('.service-category-tile').forEach(tile => {
                tile.onclick = () => {
                    const service = tile.getAttribute('data-service');
                    // Always read the LIVE location from the display element
                    const liveLocation = document.getElementById('home-location-display')?.textContent?.trim() || currentCustomerLocation || 'Unknown Location';
                    currentCustomerLocation = liveLocation;
                    window.currentCustomerLocation = liveLocation;
                    // Highlight selected tile
                    document.querySelectorAll('.service-category-tile').forEach(t => t.classList.remove('selected'));
                    tile.classList.add('selected');
                    // Show workers section, hide categories
                    document.getElementById('service-categories-grid').closest('.services-section').style.display = 'none';
                    const workersSection = document.getElementById('service-workers-section');
                    workersSection.style.display = 'block';
                    document.getElementById('service-workers-title').textContent = service + ' Workers in ' + liveLocation;
                    window.fetchWorkersByService(liveLocation, service);
                };
            });

            // Back button  return to categories grid
            const backBtn = document.getElementById('btn-back-to-services');
            if (backBtn) {
                backBtn.onclick = () => {
                    document.getElementById('service-workers-section').style.display = 'none';
                    document.getElementById('service-categories-grid').closest('.services-section').style.display = 'block';
                    document.querySelectorAll('.service-category-tile').forEach(t => t.classList.remove('selected'));
                };
            }
        }
    }

    // --- Dynamic Worker Fetching ---
    window.fetchWorkersByLocation = async (location) => {
        const grid = document.getElementById('dynamic-workers-grid');
        if (!grid) return;
        
        grid.innerHTML = '<p style="text-align: center; width: 100%; color: #666;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading workers in ' + location + '...</p>';
        
        try {
            // Check for busy workers
            const busyWorkerIds = new Set();
            try {
                const bQuery = query(collection(db, "bookings"), where("status", "in", ["Pending", "Accepted", "Reached", "PaymentPending"]));
                const bSnap = await getDocs(bQuery);
                bSnap.forEach(bDoc => {
                    if (bDoc.data().workerId) {
                        busyWorkerIds.add(bDoc.data().workerId);
                    }
                });
            } catch(e) {
                console.error("Failed to fetch busy workers", e);
            }

            const q = query(collection(db, "customers"));
            const querySnapshot = await getDocs(q);
            
            const workers = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.role === 'worker' || data.role === 'both') {
                    if (data.service && data.location && location) {
                        const workerLoc = data.location.toLowerCase().trim();
                        const userLoc = location.toLowerCase().trim();
                        if (workerLoc.includes(userLoc) || userLoc.includes(workerLoc)) {
                            workers.push({ id: doc.id, ...data });
                        }
                    }
                }
            });
            
            if (workers.length === 0) {
                grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 12px;">
                    <i class="fa-solid fa-person-digging" style="font-size: 32px; color: var(--text-secondary); margin-bottom: 15px;"></i>
                    <p style="color: var(--text-secondary);">No workers available in <b>${location}</b> yet.</p>
                </div>`;
                return;
            }
            
            grid.innerHTML = '';
            workers.forEach(worker => {
                const card = document.createElement('div');
                card.className = 'service-card';
                const bgImage = getServiceImage(worker.service);
                const profileImg = worker.profileImage ? `<img src="${worker.profileImage}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">` : `<div style="width: 40px; height: 40px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"><i class="fa-solid fa-user" style="color: #999;"></i></div>`;
                
                const isBusy = busyWorkerIds.has(worker.id);
                
                const todayStr = new Date().toISOString().split('T')[0];
                const leaveEndDate = (worker.leave && worker.leave.endDate) || (worker.leave && worker.leave.date);
                const isOnLeave = worker.leave && worker.leave.active && leaveEndDate >= todayStr;
                
                let btnHtml;
                let statusBadge = '';
                
                if (isOnLeave) {
                    let timingText = worker.leave.type === 'Half Day' ? ` (${worker.leave.timing})` : '';
                    let dateText = worker.leave.date === leaveEndDate ? worker.leave.date : `${worker.leave.date} to ${leaveEndDate}`;
                    btnHtml = `<div class="service-book-btn" style="background: #e0e0e0; color: #555; cursor: not-allowed; text-align: center; font-size: 12px; line-height: 1.4; padding: 6px;">On Leave: ${worker.leave.reason}<br>${dateText} | ${worker.leave.type}${timingText}</div>`;
                    statusBadge = '<span style="font-size: 11px; padding: 2px 6px; background: #ffebee; color: red; border-radius: 4px; margin-left: 5px;">On Leave</span>';
                } else if (isBusy) {
                    btnHtml = `<div class="service-book-btn" style="background: #ccc; cursor: not-allowed; text-align: center;">Currently Busy</div>`;
                    statusBadge = '<span style="font-size: 11px; padding: 2px 6px; background: #ffebee; color: red; border-radius: 4px; margin-left: 5px;">Busy</span>';
                } else {
                    btnHtml = `<div class="service-book-btn" data-service="${worker.service}" data-worker-id="${worker.id}" data-worker-name="${worker.name}">Book Now <i class="fa-solid fa-arrow-right"></i></div>`;
                }
                
                let avgRating = 0;
                let ratingCount = 0;
                if (worker.ratings && worker.ratings.length > 0) {
                    ratingCount = worker.ratings.length;
                    const sum = worker.ratings.reduce((acc, r) => acc + r.stars, 0);
                    avgRating = (sum / ratingCount).toFixed(1);
                }
                
                // Rapido/Swiggy-style rating badge on image
                const ratingBadge = avgRating > 0
                    ? `<div style="position:absolute; top:10px; right:10px; background:${avgRating >= 4 ? '#2e7d32' : avgRating >= 3 ? '#f57c00' : '#c62828'}; color:white; font-size:12px; font-weight:700; padding:3px 8px; border-radius:20px; display:flex; align-items:center; gap:3px; box-shadow:0 2px 6px rgba(0,0,0,0.25);"><i class="fa-solid fa-star" style="font-size:10px;"></i> ${avgRating}</div>`
                    : `<div style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.45); color:white; font-size:11px; font-weight:600; padding:3px 8px; border-radius:20px;">New</div>`;
                
                const reviewLink = ratingCount > 0
                    ? `<div style="font-size:12px; color:#888; margin-bottom:8px; cursor:pointer;" onclick="event.stopPropagation(); window.openAdminComments('${worker.id}', '${(worker.name || 'Worker').replace(/'/g, "\'")}')">${ratingCount} review${ratingCount > 1 ? 's' : ''} &rsaquo;</div>`
                    : `<div style="font-size:12px; color:#aaa; margin-bottom:8px;">No reviews yet</div>`;

                card.innerHTML = `
                    <div class="service-image" style="background-image: url('${bgImage}'); position: relative;">
                        ${ratingBadge}
                        <div style="position: absolute; bottom: -20px; left: 15px;">
                            ${profileImg}
                        </div>
                    </div>
                    <div class="service-info" style="padding-top: 25px;">
                        <h4 style="margin-bottom: 3px; display: flex; align-items: center; gap: 5px;">${worker.name} ${statusBadge}</h4>
                        <p style="color:var(--primary-blue);font-weight:500;font-size:13px;margin-bottom:5px;">${worker.service} Professional</p>
                        <p style="font-size:12px;margin-bottom:4px;"><i class="fa-solid fa-location-dot"></i> ${worker.location}</p>
                        ${reviewLink}
                        ${btnHtml}
                    </div>
                `;
                grid.appendChild(card);
            });
            
            attachDynamicBookingListeners();
            
        } catch (error) {
            console.error("Error fetching workers: ", error);
            grid.innerHTML = '<p style="text-align: center; width: 100%; color: red;">Failed to load workers.</p>';
        }
    }

    // Helper: get bg image for a service
    function getServiceImage(service) {
        const map = {
            'Plumbing':       'service_plumber_1787641527684.jpg',
            'Electrical':     'service_electrician_1787641544945.jpg',
            'AC Repair':      'service_ac_repair_1787641677058.jpg',
            'Carpentry':      'service_carpenter_1787641755840.jpg',
            'Car Wash':       'service_carwash.jpg',
            'House Painting': 'service_painting.jpg',
            'Home Cleaning':  'service_cleaning.jpg'
        };
        return map[service] || ('https://via.placeholder.com/400x200?text=' + encodeURIComponent(service));
    }

    // --- Fetch workers by service (and location) ---
    window.fetchWorkersByService = async (location, service) => {
        const grid = document.getElementById('dynamic-workers-grid');
        if (!grid) return;

        grid.innerHTML = `<p style="text-align:center;width:100%;color:#666;"><i class="fa-solid fa-circle-notch fa-spin"></i> Finding ${service} workers in ${location}...</p>`;

        if (window.currentWorkersListener) window.currentWorkersListener();
        if (window.currentBusyListener) window.currentBusyListener();

        let busyWorkerIds = new Set();
        let workers = [];

        const renderWorkers = () => {
            if (workers.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:40px 20px;background:white;border-radius:12px;">
                        <i class="fa-solid fa-person-digging" style="font-size:36px;color:var(--text-secondary);margin-bottom:14px;"></i>
                        <p style="color:var(--text-secondary);font-weight:600;font-size:15px;">${service}</p>
                        <p style="color:var(--text-secondary);font-size:13px;margin-top:6px;">No workers registered for this service in <b>${location}</b> yet.</p>
                    </div>`;
                return;
            }

            grid.innerHTML = '';
            workers.forEach(worker => {
                const card = document.createElement('div');
                card.className = 'service-card';
                const mainImageHtml = worker.profileImage ? 
                    `<div class="service-image" style="background-image: url('${worker.profileImage}'); background-size: cover; background-position: top; border-radius: 12px 12px 0 0;"></div>` : 
                    `<div class="service-image" style="background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; border-radius: 12px 12px 0 0; color: #ccc; font-size: 50px;"><i class="fa-solid fa-user"></i></div>`;
                
                const isBusy = busyWorkerIds.has(worker.id);
                
                const todayStr = new Date().toISOString().split('T')[0];
                const leaveEndDate = (worker.leave && worker.leave.endDate) || (worker.leave && worker.leave.date);
                const isOnLeave = worker.leave && worker.leave.active && leaveEndDate >= todayStr;
                
                let btnHtml;
                let statusBadge = '';
                
                if (isOnLeave) {
                    let timingText = worker.leave.type === 'Half Day' ? ` (${worker.leave.timing})` : '';
                    let dateText = worker.leave.date === leaveEndDate ? worker.leave.date : `${worker.leave.date} to ${leaveEndDate}`;
                    btnHtml = `<div class="service-book-btn" style="background: #e0e0e0; color: #555; cursor: not-allowed; text-align: center; font-size: 12px; line-height: 1.4; padding: 6px;">On Leave: ${worker.leave.reason}<br>${dateText} | ${worker.leave.type}${timingText}</div>`;
                    statusBadge = '<span style="font-size: 11px; padding: 2px 6px; background: #ffebee; color: red; border-radius: 4px; margin-left: 5px;">On Leave</span>';
                } else if (isBusy) {
                    btnHtml = `<div class="service-book-btn" style="background: #ccc; cursor: not-allowed; text-align: center;">Currently Busy</div>`;
                    statusBadge = '<span style="font-size: 11px; padding: 2px 6px; background: #ffebee; color: red; border-radius: 4px; margin-left: 5px;">Busy</span>';
                } else {
                    btnHtml = `<div class="service-book-btn" data-service="${worker.service}" data-worker-id="${worker.id}" data-worker-name="${worker.name}">Book Now <i class="fa-solid fa-arrow-right"></i></div>`;
                }
                
                let avgRating = 0;
                let ratingCount = 0;
                if (worker.ratings && worker.ratings.length > 0) {
                    ratingCount = worker.ratings.length;
                    const sum = worker.ratings.reduce((acc, r) => acc + r.stars, 0);
                    avgRating = (sum / ratingCount).toFixed(1);
                }
                
                // Rapido/Swiggy-style rating badge - overlay on main image
                let mainImageWithBadge;
                const ratingBadge2 = avgRating > 0
                    ? `<div style="position:absolute; top:10px; right:10px; background:${avgRating >= 4 ? '#2e7d32' : avgRating >= 3 ? '#f57c00' : '#c62828'}; color:white; font-size:12px; font-weight:700; padding:3px 8px; border-radius:20px; display:flex; align-items:center; gap:3px; box-shadow:0 2px 6px rgba(0,0,0,0.25);"><i class="fa-solid fa-star" style="font-size:10px;"></i> ${avgRating}</div>`
                    : `<div style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.45); color:white; font-size:11px; font-weight:600; padding:3px 8px; border-radius:20px;">New</div>`;

                if (worker.profileImage) {
                    mainImageWithBadge = `<div class="service-image" style="background-image: url('${worker.profileImage}'); background-size: cover; background-position: top; border-radius: 12px 12px 0 0; position:relative;">${ratingBadge2}</div>`;
                } else {
                    mainImageWithBadge = `<div class="service-image" style="background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; border-radius: 12px 12px 0 0; color: #ccc; font-size: 50px; position:relative;"><i class="fa-solid fa-user"></i>${ratingBadge2}</div>`;
                }

                const reviewLink2 = ratingCount > 0
                    ? `<div style="font-size:12px; color:#888; margin-bottom:8px; cursor:pointer;" onclick="event.stopPropagation(); window.openAdminComments('${worker.id}', '${(worker.name || 'Worker').replace(/'/g, "\'")}')">${ratingCount} review${ratingCount > 1 ? 's' : ''} &rsaquo;</div>`
                    : `<div style="font-size:12px; color:#aaa; margin-bottom:8px;">No reviews yet</div>`;

                card.innerHTML = `
                    ${mainImageWithBadge}
                    <div class="service-info">
                        <h4 style="margin-bottom: 3px; display: flex; align-items: center; gap: 5px;">${worker.name} ${statusBadge}</h4>
                        <p style="color:var(--primary-blue);font-weight:500;font-size:13px;margin-bottom:5px;">${worker.service} Professional</p>
                        <p style="font-size:12px;margin-bottom:6px;"><i class="fa-solid fa-location-dot"></i> ${worker.location}</p>
                        ${reviewLink2}
                        ${btnHtml}
                    </div>
                `;
                grid.appendChild(card);
            });

            attachDynamicBookingListeners();
        };

        const bQuery = query(collection(db, "bookings"), where("status", "in", ["Pending", "Accepted", "Reached", "PaymentPending"]));
        window.currentBusyListener = onSnapshot(bQuery, (bSnap) => {
            busyWorkerIds.clear();
            bSnap.forEach(bDoc => {
                if (bDoc.data().workerId) {
                    busyWorkerIds.add(bDoc.data().workerId);
                }
            });
            renderWorkers();
        }, (e) => {
            console.error("Failed to fetch busy workers", e);
        });

        // Guard: if no valid location, show message instead of all workers
        const cleanLocation = (location || '').trim();
        if (!cleanLocation || cleanLocation === 'Unknown Location' || cleanLocation === 'Loading...') {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;background:white;border-radius:12px;">
                <i class="fa-solid fa-map-location-dot" style="font-size:36px;color:var(--primary-blue);margin-bottom:14px;"></i>
                <p style="color:var(--text-secondary);font-weight:600;font-size:15px;">Please select your location first</p>
                <p style="color:var(--text-secondary);font-size:13px;margin-top:6px;">Tap the location bar at the top to set your city.</p>
            </div>`;
            return;
        }

        const q = query(collection(db, "customers"), where("service", "==", service));
        window.currentWorkersListener = onSnapshot(q, (querySnapshot) => {
            workers = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if ((data.role === 'worker' || data.role === 'both') && data.location) {
                    const stripForMatch = (str) => str.toLowerCase().replace(/[aeiou\s[^a-z0-9]]/g, '');
                    const workerLoc = stripForMatch(data.location);
                    const userLoc = stripForMatch(cleanLocation);
                    
                    if (workerLoc.includes(userLoc) || userLoc.includes(workerLoc)) {
                        // Deduplicate by UID or exact Name in case of multiple test profile documents
                        if (!workers.find(w => w.id === data.uid || (w.name && w.name === data.name))) {
                            workers.push({ id: data.uid, ...data });
                        }
                    }
                }
            });
            renderWorkers();
        }, (error) => {
            console.error("Error fetching workers by service:", error);
            grid.innerHTML = '<p style="text-align:center;width:100%;color:red;">Failed to load workers.</p>';
        });
    }

    // --- Service Booking Logic ---
    const bookingModal = document.getElementById('service-booking-modal');
    const closeBookingBtn = document.getElementById('close-booking-modal');
    const bookingForm = document.getElementById('booking-form');
    const bookingTitle = document.getElementById('booking-modal-title');
    const bookImageInput = document.getElementById('book-image');
    const uploadBox = document.getElementById('upload-box');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
    
    let currentServiceToBook = "";
    let compressedImageData = null;
    
    function attachDynamicBookingListeners() {
        document.querySelectorAll('.service-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentServiceToBook = e.currentTarget.getAttribute('data-service');
                const workerName = e.currentTarget.getAttribute('data-worker-name');
                const workerId = e.currentTarget.getAttribute('data-worker-id');
                
                bookingTitle.textContent = `Book ${workerName} (${currentServiceToBook})`;
                // Store worker ID for submission if needed later
                bookingForm.setAttribute('data-target-worker-id', workerId);
                
                bookingModal.classList.remove('hidden');
                setTimeout(() => bookingModal.classList.add('open'), 10);
                
                // Pre-fill city if we have it
                const profileLoc = document.getElementById('profile-location-display')?.textContent;
                if (profileLoc && profileLoc !== "Unknown Location") {
                    const cityInput = document.getElementById('book-city');
                    if (cityInput) cityInput.value = profileLoc;
                }
                
                // Allow clicking anywhere on the date input to open calendar picker
                const dateInput = document.getElementById('book-date');
                if (dateInput) {
                    dateInput.onclick = function() {
                        try {
                            this.showPicker();
                        } catch(e) {}
                    };
                }
            });
        });
    }

    // Close Booking Modal
    if (closeBookingBtn) {
        closeBookingBtn.addEventListener('click', () => {
            bookingModal.classList.remove('open');
            setTimeout(() => {
                bookingModal.classList.add('hidden');
                bookingForm.reset();
                removeImage();
            }, 300);
        });
    }

    // Handle Image Selection & Compression
    if (bookImageInput) {
        bookImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Compress image using Canvas to save DB space
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                bookingCropperImage.src = event.target.result;
                bookingCropperModal.style.display = 'flex';
                setTimeout(() => bookingCropperModal.classList.remove('hidden'), 50);
                
                if (bookingCropperInstance) {
                    bookingCropperInstance.destroy();
                }
                
                setTimeout(() => {
                    bookingCropperInstance = new Cropper(bookingCropperImage, {
                        aspectRatio: NaN, // free cropping
                        viewMode: 1,
                        autoCropArea: 1,
                    });
                }, 100);
            };
        });
    }

    const removeImage = () => {
        bookImageInput.value = "";
        compressedImageData = null;
        imagePreview.src = "";
        imagePreviewContainer.classList.add('hidden');
        uploadBox.style.display = 'flex';
    };

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', removeImage);
    }

    // Submit Booking
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            bookingForm.classList.add('was-validated');
            
            const bookingError = document.getElementById('booking-error');
            if (bookingError) bookingError.style.display = 'none';

            if (!bookingForm.checkValidity()) {
                if (bookingError) bookingError.style.display = 'block';
                bookingForm.reportValidity(); // show browser tooltip
                return;
            }

            const btn = document.getElementById('order-now-btn');
            const originalText = btn.textContent;
            
            const date = document.getElementById('book-date').value;
            const flat = document.getElementById('book-flat').value;
            const area = document.getElementById('book-area').value;
            const landmark = document.getElementById('book-landmark').value;
            const pincode = document.getElementById('book-pincode').value;
            const city = document.getElementById('book-city').value;
            const state = document.getElementById('book-state').value;
            const problem = document.getElementById('book-problem').value;
            
            // Combine address components
            let fullAddress = `${flat}, ${area}`;
            if (landmark) fullAddress += `, near ${landmark}`;
            fullAddress += `, ${city}, ${state} - ${pincode}`;
            
            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to book a service.");
                return;
            }

            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
            btn.disabled = true;
            btn.style.opacity = '0.8';

            try {
                const targetWorkerId = bookingForm.getAttribute('data-target-worker-id');
                // Ensure chat deletion is canceled when a new booking is created
                if (window.cancelChatDeletion) window.cancelChatDeletion(user.uid, targetWorkerId);

                await addDoc(collection(db, "bookings"), {
                    userId: user.uid,
                    workerId: targetWorkerId,
                    service: currentServiceToBook,
                    date: date,
                    address: fullAddress,
                    description: problem,
                    image: compressedImageData, // Base64 string or null
                    status: "Pending",
                    timestamp: new Date()
                });
                
                // Notify the worker
                addNotification(targetWorkerId, `You have a new booking request for ${currentServiceToBook}!`);

                btn.innerHTML = 'Success!';
                btn.style.backgroundColor = 'var(--accent-green)';
                
                setTimeout(() => {
                    // Close Modal
                    bookingModal.classList.remove('open');
                    setTimeout(() => {
                        bookingModal.classList.add('hidden');
                        bookingForm.reset();
                        removeImage();
                        btn.innerHTML = originalText;
                        btn.style.backgroundColor = '';
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        
                        // Switch to My Bookings tab automatically
                        document.querySelector('.nav-item[data-target="view-bookings"]').click();
                    }, 300);
                }, 1000);

            } catch (error) {
                console.error("Error creating booking:", error);
                alert("Failed to create booking: " + error.message);
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        });
    }

    // Amount Modal Logic
    const closeAmountModal = document.getElementById('close-amount-modal');
    if(closeAmountModal) {
        closeAmountModal.onclick = () => {
            const modal = document.getElementById('amount-modal');
            modal.classList.add('hidden');
            setTimeout(() => modal.style.display = 'none', 300);
        };
    }
    const amountForm = document.getElementById('amount-form');
    if(amountForm) {
        amountForm.onsubmit = async (e) => {
            e.preventDefault();
            const id = amountForm.getAttribute('data-booking-id');
            const amount = document.getElementById('bill-amount').value;
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            
            await updateDoc(doc(db, "bookings", id), {
                status: 'PaymentPending',
                amount: Number(amount),
                otp: otp
            });
            
            const bookingDoc = await getDoc(doc(db, "bookings", id));
            if(bookingDoc.exists()) {
                addNotification(bookingDoc.data().userId, `Your job is done! Please pay ${amount} and share OTP ${otp} with the worker.`);
            }
            
            closeAmountModal.click();
            amountForm.reset();
            if (window.fetchBookings) fetchBookings(auth.currentUser.uid);
        };
    }

    // Receipt Modal Logic
    const closeReceiptModal = document.getElementById('close-receipt-modal');
    if (closeReceiptModal) {
        closeReceiptModal.onclick = () => {
            const modal = document.getElementById('receipt-modal');
            modal.classList.add('hidden');
            setTimeout(() => modal.style.display = 'none', 300);
        };
    }


    // OTP Verify Modal Logic
    const closeOtpVerifyModal = document.getElementById('close-otp-verify-modal');
    if(closeOtpVerifyModal) {
        closeOtpVerifyModal.onclick = () => {
            const modal = document.getElementById('otp-verify-modal');
            modal.classList.add('hidden');
            setTimeout(() => modal.style.display = 'none', 300);
        };
    }
    const otpVerifyForm = document.getElementById('otp-verify-form');
    if(otpVerifyForm) {
        otpVerifyForm.onsubmit = async (e) => {
            e.preventDefault();
            const id = otpVerifyForm.getAttribute('data-booking-id');
            const enteredOtp = document.getElementById('verify-customer-otp').value;
            
            const errorDiv = document.getElementById('otp-verify-error');
            errorDiv.style.display = 'none'; // reset on submit
            
            // Get booking to verify OTP
            const bookingDoc = await getDoc(doc(db, "bookings", id));
            if (bookingDoc.exists()) {
                const booking = bookingDoc.data();
                if (booking.otp === enteredOtp) {
                    await updateDoc(doc(db, "bookings", id), { status: 'Completed' });
                    if (window.scheduleChatDeletion) window.scheduleChatDeletion(booking.userId, booking.workerId);
                    closeOtpVerifyModal.click();
                    otpVerifyForm.reset();
                    if (window.fetchBookings) fetchBookings(auth.currentUser.uid);
                    alert("Payment Verified & Job Completed!");
                    
                    addNotification(booking.userId, `Payment verified successfully. Job Completed!`);
                } else {
                    errorDiv.textContent = "Invalid OTP! Please check with the customer.";
                    errorDiv.style.display = 'block';
                }
            }
        };
    }

    // Fetch and Render Bookings
    const fetchBookings = async (userId) => {
        const bookingsList = document.getElementById('my-bookings-list');
        if (!bookingsList) return;
        
        bookingsList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>';
        
        const isWorker = window.selectedSessionRole === 'worker';
        const queryField = isWorker ? "workerId" : "userId";
        
        try {
            const qDocs = query(collection(db, "bookings"), where(queryField, "==", userId));
            const querySnapshot = await getDocs(qDocs);
            
            const bookings = [];
            querySnapshot.forEach(doc => bookings.push({ id: doc.id, ...doc.data() }));
            
            if (bookings.length === 0) {
                bookingsList.innerHTML = '<div class="empty-state">You have no active bookings at this time.</div>';
                return;
            }
            
            // Sort client-side by timestamp descending (safe fallback if timestamp missing)
            bookings.sort((a, b) => {
                const ta = a.timestamp ? a.timestamp.toMillis() : 0;
                const tb = b.timestamp ? b.timestamp.toMillis() : 0;
                return tb - ta;
            });
            
            bookingsList.innerHTML = '';
            
            let addedCount = 0;
            bookings.forEach(booking => {
                if (booking.status === 'Completed' || booking.status === 'Canceled') return; // Hide completed/canceled bookings
                
                addedCount++;

                const card = document.createElement('div');
                card.className = 'booking-card';
                
                const dateObj = new Date(booking.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                const imgHtml = isWorker ? 
                    (booking.image ? `<img src="${booking.image}" class="booking-image-thumb" alt="Problem Image">` : '') : 
                    `<div style="width: 80px; height: 80px; background-color: #f0f0f0; border-radius: 12px; display: flex; justify-content: center; align-items: center; color: var(--primary-blue); font-size: 32px;"><i class="fa-solid fa-user-tie"></i></div>`;
                
                let extraHtml = '';
                let actionsHtml = '';
                
                if (isWorker) {
                    if (booking.status === 'Pending') {
                        actionsHtml += `
                            <div class="dropdown-item accept-job-btn" data-id="${booking.id}" style="padding: 10px 15px; cursor: pointer; color: green; border-bottom: 1px solid #eee;"> Accept Work</div>
                            <div class="dropdown-item cancel-job-btn" data-id="${booking.id}" style="padding: 10px 15px; cursor: pointer; color: red;"> Cancel Work</div>
                        `;
                    } else if (booking.status === 'Accepted') {
                        actionsHtml += `
                            <div class="dropdown-item reached-job-btn" data-id="${booking.id}" style="padding: 10px 15px; cursor: pointer; color: var(--primary-blue); border-bottom: 1px solid #eee;"> Mark as Reached</div>
                            <div class="dropdown-item cancel-job-btn" data-id="${booking.id}" style="padding: 10px 15px; cursor: pointer; color: red;"> Cancel Work</div>
                        `;
                    } else if (booking.status === 'Reached') {
                         actionsHtml += `
                            <div class="dropdown-item job-done-btn" data-id="${booking.id}" style="padding: 10px 15px; cursor: pointer; color: var(--primary-blue); border-bottom: 1px solid #eee;"> Mark Job Done</div>
                            <div class="dropdown-item cancel-job-btn" data-id="${booking.id}" style="padding: 10px 15px; cursor: pointer; color: red;"> Cancel Work</div>
                        `;
                    } else if (booking.status === 'PaymentPending') {
                         actionsHtml += `
                            <div class="dropdown-item force-complete-btn" data-id="${booking.id}" style="padding: 10px 15px; cursor: pointer; color: green;"> Mark Completed (Release)</div>
                        `;
                        extraHtml += `
                            <div style="margin-top: 15px; padding: 15px; background: #fff3e0; border-radius: 8px; border: 1px solid #ffe0b2;">
                                <div style="font-size: 14px; color: #333; margin-bottom: 8px;"><strong>Worker:</strong> Enter OTP from customer to verify payment:</div>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="inline-otp-worker-mybooking-${booking.id}" placeholder="6-digit code" maxlength="6" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ccc; outline: none; font-size: 16px;">
                                    <button class="login-btn inline-verify-btn-worker-mybooking" data-id="${booking.id}" style="width: auto; padding: 0 20px; margin: 0; background-color: var(--accent-green);">Verify</button>
                                </div>
                                <div id="inline-otp-error-${booking.id}" style="color: red; font-size: 13px; margin-top: 8px; display: none; font-weight: bold;">Invalid OTP! Please check with the customer.</div>
                            </div>
                        `;
                    }
                } else {
                    if (booking.status === 'Pending') {
                        actionsHtml += `<div class="dropdown-item cancel-job-btn-customer" data-id="${booking.id}" style="padding: 10px 15px; cursor: pointer; color: red;"> Cancel Order</div>`;
                    }
                    if (booking.status === 'PaymentPending') {
                        extraHtml += `
                            <div style="margin-top: 15px; padding: 15px; background: #e8f5e9; border-radius: 8px; border: 1px solid #c8e6c9;">
                                <div style="color: var(--accent-green); font-weight: 700; margin-bottom: 8px; font-size: 16px;">
                                    Bill Amount: ${booking.amount}
                                </div>
                                <div style="font-size: 14px; color: #333; margin-bottom: 5px;">Share this OTP with the worker to complete payment:</div>
                                <div style="font-size: 24px; font-weight: 800; letter-spacing: 4px; color: var(--primary-blue); text-align: center;">
                                    ${booking.otp}
                                </div>
                            </div>
                        `;
                    }
                }


                const threeDotsMenu = actionsHtml ? `
                    <div class="booking-menu" style="position: relative; display: inline-block; margin-left: 10px;">
                        <i class="fa-solid fa-ellipsis-vertical toggle-menu" style="cursor: pointer; padding: 5px; color: #888;"></i>
                        <div class="menu-dropdown" style="position: absolute; right: 0; top: 100%; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px; z-index: 100; width: 200px; padding: 5px 0; display: none;">
                            ${actionsHtml}
                        </div>
                    </div>
                ` : '';

                const statusOrder = ['Pending', 'Accepted', 'Reached', 'PaymentPending', 'Completed'];
                const currentStatusIndex = statusOrder.indexOf(booking.status);
                
                const trackingHtml = `
                    <div class="tracking-timeline">
                        <div class="tracking-step ${currentStatusIndex >= 0 ? (currentStatusIndex > 0 ? 'completed' : 'active') : ''}">
                            <div class="tracking-icon"><i class="fa-solid fa-clipboard-check"></i></div>
                            <div class="tracking-label">Placed</div>
                        </div>
                        <div class="tracking-step ${currentStatusIndex >= 1 ? (currentStatusIndex > 1 ? 'completed' : 'active') : ''}">
                            <div class="tracking-icon"><i class="fa-solid fa-user-gear"></i></div>
                            <div class="tracking-label">Accepted</div>
                        </div>
                        <div class="tracking-step ${currentStatusIndex >= 2 ? (currentStatusIndex > 2 ? 'completed' : 'active') : ''}">
                            <div class="tracking-icon"><i class="fa-solid fa-house"></i></div>
                            <div class="tracking-label">Reached</div>
                        </div>
                        <div class="tracking-step ${currentStatusIndex >= 3 ? (currentStatusIndex > 3 ? 'completed' : 'active') : ''}">
                            <div class="tracking-icon"><i class="fa-solid fa-indian-rupee-sign"></i></div>
                            <div class="tracking-label">Payment</div>
                        </div>
                        <div class="tracking-step ${currentStatusIndex >= 4 ? 'completed' : ''}">
                            <div class="tracking-icon"><i class="fa-solid fa-check-double"></i></div>
                            <div class="tracking-label">Done</div>
                        </div>
                    </div>
                `;

                card.innerHTML = `
                    <div class="booking-header">
                        <span class="booking-service">${booking.service}</span>
                        <div style="display: flex; align-items: center;">
                            <span class="booking-status status-${booking.status.toLowerCase()}">${booking.status}</span>
                            <i class="fa-solid fa-message message-other-user-btn" data-target-uid="${isWorker ? booking.userId : booking.workerId}" data-target-name="${isWorker ? 'Customer' : 'Worker'}" style="margin-left: 15px; cursor: pointer; color: var(--primary-blue); font-size: 18px;" title="Chat"></i>
                            ${threeDotsMenu}
                        </div>
                    </div>
                    ${trackingHtml}
                    <div class="booking-details" style="margin-top: 15px;">
                        <div class="booking-info">
                            <div><i class="fa-solid fa-calendar-days"></i> ${formattedDate}</div>
                            <div><i class="fa-solid fa-location-dot"></i> ${(booking.address || 'No address').substring(0, 30)}${(booking.address || '').length > 30 ? '...' : ''}</div>
                            <div style="margin-top: 5px; color: #333;"><strong>Desc:</strong> ${(booking.description || 'No description').substring(0, 50)}${(booking.description || '').length > 50 ? '...' : ''}</div>
                        </div>
                        ${imgHtml}
                    </div>
                    ${extraHtml}
                `;
                bookingsList.appendChild(card);
            });

            if (addedCount === 0) {
                bookingsList.innerHTML = '<div class="empty-state">You have no active bookings at this time.</div>';
            }

            // 3-dots menu logic
            document.querySelectorAll('.toggle-menu').forEach(btn => {
                btn.onclick = (e) => {
                    const dropdown = e.target.nextElementSibling;
                    const isHidden = dropdown.style.display === 'none' || dropdown.style.display === '';
                    // Close all other dropdowns
                    document.querySelectorAll('.menu-dropdown').forEach(d => d.style.display = 'none');
                    if (isHidden) dropdown.style.display = 'block';
                };
            });

            // Message Other User logic
            document.querySelectorAll('.message-other-user-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const targetUid = btn.getAttribute('data-target-uid');
                    const targetName = btn.getAttribute('data-target-name');
                    if (targetUid) {
                        window.openChatModal(targetUid, targetName);
                    } else {
                        alert("Cannot start chat. The user ID is missing (this might be a legacy booking).");
                    }
                };
            });

            if (isWorker) {
                document.querySelectorAll('#my-bookings-list .inline-verify-btn-worker-mybooking').forEach(btn => {
                    btn.onclick = async () => {
                        const id = btn.getAttribute('data-id');
                        const inputElement = document.getElementById(`inline-otp-worker-mybooking-${id}`);
                        const enteredOtp = inputElement.value.trim();
                        const errorDiv = document.getElementById(`inline-otp-error-${id}`);
                        if (!enteredOtp) {
                            errorDiv.textContent = "Please enter the 6-digit OTP.";
                            errorDiv.style.display = 'block';
                            return;
                        }

                        const bookingDoc = await getDoc(doc(db, "bookings", id));
                        if (bookingDoc.exists()) {
                            const booking = bookingDoc.data();
                            if (booking.otp === enteredOtp) {
                                errorDiv.style.display = 'none';
                                await updateDoc(doc(db, "bookings", id), { status: 'Completed' });
                                if (window.scheduleChatDeletion) window.scheduleChatDeletion(booking.userId, booking.workerId);
                                alert("Payment Verified & Job Completed!");
                                addNotification(booking.userId, `Payment verified successfully. Job Completed!`);
                                fetchBookings(userId);
                            } else {
                                errorDiv.textContent = "Invalid OTP! Please check with the customer.";
                                errorDiv.style.display = 'block';
                            }
                        }
                    };
                });

                document.querySelectorAll('#my-bookings-list .force-complete-btn').forEach(btn => {
                    btn.onclick = async () => {
                        if (confirm("Are you sure you want to mark this job as completed? This will bypass the OTP and release you for other bookings.")) {
                            const id = btn.getAttribute('data-id');
                            await updateDoc(doc(db, "bookings", id), { status: 'Completed' });
                            const bDoc = await getDoc(doc(db, "bookings", id));
                            if (bDoc.exists() && window.scheduleChatDeletion) window.scheduleChatDeletion(bDoc.data().userId, bDoc.data().workerId);
                            alert("Job forcefully completed. You are now available for other bookings!");
                            
                            const bookingDoc = await getDoc(doc(db, "bookings", id));
                            if(bookingDoc.exists()) {
                                addNotification(bookingDoc.data().userId, "Your worker has marked the job as Completed.");
                            }
                            fetchBookings(userId);
                        }
                    };
                });

                document.querySelectorAll('#my-bookings-list .accept-job-btn').forEach(btn => {
                    btn.onclick = async () => {
                        const id = btn.getAttribute('data-id');
                        await updateDoc(doc(db, "bookings", id), { status: 'Accepted' });
                        fetchBookings(userId);
                        
                        const bookingDoc = await getDoc(doc(db, "bookings", id));
                        if(bookingDoc.exists()) {
                            addNotification(bookingDoc.data().userId, "Your booking has been Accepted by the worker.");
                        }
                    };
                });

                document.querySelectorAll('#my-bookings-list .cancel-job-btn').forEach(btn => {
                    btn.onclick = async () => {
                        if (confirm("Are you sure you want to cancel this job?")) {
                            const id = btn.getAttribute('data-id');
                            await updateDoc(doc(db, "bookings", id), { status: 'Canceled' });
                            fetchBookings(userId);
                            
                            const bookingDoc = await getDoc(doc(db, "bookings", id));
                            if(bookingDoc.exists()) {
                                addNotification(bookingDoc.data().userId, "Your booking was canceled by the worker.");
                            }
                        }
                    };
                });

                document.querySelectorAll('#my-bookings-list .reached-job-btn').forEach(btn => {
                    btn.onclick = async () => {
                        const id = btn.getAttribute('data-id');
                        await updateDoc(doc(db, "bookings", id), { status: 'Reached' });
                        fetchBookings(userId);
                        
                        const bookingDoc = await getDoc(doc(db, "bookings", id));
                        if(bookingDoc.exists()) {
                            addNotification(bookingDoc.data().userId, "The worker has reached your location.");
                        }
                    };
                });

                document.querySelectorAll('#my-bookings-list .job-done-btn').forEach(btn => {
                    btn.onclick = () => {
                        const id = btn.getAttribute('data-id');
                        const modal = document.getElementById('amount-modal');
                        const form = document.getElementById('amount-form');
                        form.setAttribute('data-booking-id', id);
                        document.getElementById('bill-amount').value = '';
                        modal.style.display = 'flex';
                        setTimeout(() => modal.classList.remove('hidden'), 50);
                    };
                });
            }
            
        } catch (error) {
            console.error("Error fetching bookings:", error);
            bookingsList.innerHTML = '<div class="empty-state" style="color: red;">Error loading bookings.</div>';
        }
    };

    // Fetch History
    window.fetchHistory = async (userId) => {
        const historyList = document.getElementById('my-history-list');
        if (!historyList) return;
        historyList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>';

        try {
            const qCustomer = query(collection(db, "bookings"), where("userId", "==", userId));
            const qWorker = query(collection(db, "bookings"), where("workerId", "==", userId));
            
            const [customerSnap, workerSnap] = await Promise.all([getDocs(qCustomer), getDocs(qWorker)]);
            const historyMap = new Map();
            
            const processDoc = (doc) => {
                const data = doc.data();
                if (data.status === 'Completed' || data.status === 'Canceled') {
                    historyMap.set(doc.id, { id: doc.id, ...data });
                }
            };
            
            customerSnap.forEach(processDoc);
            workerSnap.forEach(processDoc);
            
            const history = Array.from(historyMap.values());

            if (history.length === 0) {
                historyList.innerHTML = '<div class="empty-state">No past history.</div>';
                return;
            }

            history.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
            historyList.innerHTML = '';
            
            // Pre-fetch all worker data for the history list
            const workerIds = [...new Set(history.map(b => b.workerId).filter(Boolean))];
            const workerDataMap = {};
            
            await Promise.all(workerIds.map(async (wId) => {
                let wDoc = await getDoc(doc(db, 'customers', wId));
                if (!wDoc.exists()) wDoc = await getDoc(doc(db, 'workers', wId));
                if (wDoc.exists()) workerDataMap[wId] = wDoc.data();
            }));

            history.forEach(booking => {
                const card = document.createElement('div');
                card.className = 'booking-card';
                card.style.cursor = 'pointer'; // Make it look clickable
                const dateObj = new Date(booking.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                let workerNameStr = 'Unknown Worker';
                let ratingDisplayHtml = '';
                
                if (booking.workerId && workerDataMap[booking.workerId]) {
                    const wData = workerDataMap[booking.workerId];
                    workerNameStr = wData.name || 'Worker';
                    
                    if (booking.isRated) {
                        const ratings = wData.ratings || [];
                        // Try to find by bookingId first (new ratings), otherwise take the most recent
                        let myRating = ratings.find(r => r.bookingId === booking.id);
                        if (!myRating && ratings.length > 0) {
                            // Fallback: show the most recent rating for this worker
                            myRating = [...ratings].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        }
                        if (myRating) {
                            const starIcons = Array.from({length: 5}, (_, i) =>
                                `<i class="fa-solid fa-star" style="color:${i < myRating.stars ? '#FFD700' : '#ddd'}; font-size:13px;"></i>`
                            ).join('');
                            ratingDisplayHtml = `
                                <div style="margin-top:12px; padding:10px 12px; background:#f5f7fa; border-radius:8px; border:1px solid #e4e7eb; cursor:pointer;" onclick="event.stopPropagation(); window.openAdminComments('${booking.workerId}', '${workerNameStr.replace(/'/g, "\\'")}')">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                        <span style="font-size:12px; font-weight:600; color:#444;"><i class="fa-solid fa-star" style="color:#FFD700; margin-right:4px;"></i>Your Rating</span>
                                        <span style="font-size:11px; color:var(--primary-blue); text-decoration:underline;">View All Comments</span>
                                    </div>
                                    <div style="margin-bottom:4px;">${starIcons}</div>
                                    ${myRating.comment ? `<div style="font-size:12px; color:#666; font-style:italic; margin-top:4px;">"${myRating.comment}"</div>` : ''}
                                </div>
                            `;
                        } else {
                            ratingDisplayHtml = `
                                <div style="margin-top:12px; font-size:12px; color:var(--primary-blue); cursor:pointer; text-decoration:underline;" onclick="event.stopPropagation(); window.openAdminComments('${booking.workerId}', '${workerNameStr.replace(/'/g, "\\'")}')">
                                    <i class="fa-solid fa-star" style="color:#FFD700; margin-right:4px;"></i>View Worker Ratings &amp; Comments
                                </div>
                            `;
                        }
                    }
                }
                
                card.onclick = () => {
                    const modal = document.getElementById('receipt-modal');
                    document.getElementById('receipt-service').innerText = booking.service;
                    document.getElementById('receipt-date').innerText = formattedDate;
                    document.getElementById('receipt-status').innerText = booking.status;
                    document.getElementById('receipt-status').style.color = booking.status === 'Completed' ? 'var(--accent-green)' : 'red';
                    document.getElementById('receipt-amount').innerText = booking.amount ? `${booking.amount}` : '-';
                    
                    modal.style.display = 'flex';
                    setTimeout(() => modal.classList.remove('hidden'), 50);
                };
                
                const isCanceled = booking.status === 'Canceled';
                const statusColor = isCanceled ? 'red' : 'green';
                const statusBg = isCanceled ? '#ffebee' : '#e8f5e9';
                
                const imgHtml = booking.image ? `<img src="${booking.image}" class="booking-image-thumb" alt="Problem Image">` : '';
                
                let ratingMenu = '';
                if (booking.status === 'Completed' && booking.userId === userId && !booking.isRated && booking.workerId) {
                    ratingMenu = `
                        <div style="position:relative;">
                            <i class="fa-solid fa-ellipsis-vertical" style="padding: 5px 10px; cursor: pointer; color: #999;" onclick="event.stopPropagation(); const m=this.nextElementSibling; m.style.display=m.style.display==='block'?'none':'block';"></i>
                            <div style="display:none; position:absolute; right:0; top:100%; background:white; border-radius:8px; box-shadow:0 4px 15px rgba(0,0,0,0.15); width:130px; z-index:50;">
                                <button onclick="event.stopPropagation(); window.openRatingModal('${booking.id}', '${booking.workerId}')" style="width:100%; text-align:left; padding:10px 14px; border:none; background:none; cursor:pointer; font-size:13px; color:var(--primary-blue);"><i class="fa-solid fa-star" style="margin-right:6px;"></i> Rate Worker</button>
                            </div>
                        </div>
                    `;
                }
                
                card.innerHTML = `
                    <div class="booking-header">
                        <span class="booking-service">${booking.service}</span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${ratingMenu}
                            <span class="booking-status" style="color: ${statusColor}; background: ${statusBg};">${booking.status}</span>
                        </div>
                    </div>
                    <div class="booking-details">
                        <div class="booking-info">
                            <div style="font-weight:600; color:#333; margin-bottom:4px; font-size:14px;"><i class="fa-solid fa-user-tie" style="color:var(--primary-blue); margin-right:4px;"></i> ${workerNameStr}</div>
                            <div><i class="fa-solid fa-calendar-days"></i> ${formattedDate}</div>
                            ${!isCanceled ? `<div><i class="fa-solid fa-indian-rupee-sign"></i> Paid: ${booking.amount || 0}</div>` : ''}
                        </div>
                        ${imgHtml}
                    </div>
                    ${ratingDisplayHtml}
                `;
                historyList.appendChild(card);
            });
        } catch (error) {
            console.error("Error fetching history:", error);
            historyList.innerHTML = '<div class="empty-state" style="color: red;">Error loading history.</div>';
        }
    };

    // Notifications Logic
    window.addNotification = async (userId, message) => {
        try {
            await addDoc(collection(db, "notifications"), {
                userId: userId,
                message: message,
                timestamp: new Date()
            });
        } catch(error) {
            console.error("Error adding notification", error);
        }
    };

    window.fetchNotifications = async (userId) => {
        const notifList = document.getElementById('my-notifications-list');
        if (!notifList) return;
        notifList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>';
        
        try {
            const q = query(collection(db, "notifications"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            
            const notifs = [];
            querySnapshot.forEach(doc => notifs.push({ id: doc.id, ...doc.data() }));
            
            if (notifs.length === 0) {
                notifList.innerHTML = '<div class="empty-state">No new notifications.</div>';
                return;
            }
            
            notifs.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
            notifList.innerHTML = '';
            
            notifs.forEach(notif => {
                const card = document.createElement('div');
                card.className = 'booking-card';
                card.style.padding = '15px';
                card.style.cursor = 'pointer';
                
                const dateObj = new Date(notif.timestamp.toMillis());
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
                
                card.innerHTML = `
                    <div style="font-size: 15px; color: #333; margin-bottom: 8px;">${notif.message}</div>
                    <div style="font-size: 12px; color: #888;"><i class="fa-solid fa-clock"></i> ${formattedDate}</div>
                `;
                
                card.onclick = () => {
                    document.querySelector('.nav-item[data-target="view-bookings"]').click();
                };
                
                notifList.appendChild(card);
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            notifList.innerHTML = '<div class="empty-state" style="color: red;">Error loading notifications.</div>';
        }
    };

    // --- Avatar Upload Logic ---
    const avatarEditBtn = document.getElementById('avatar-edit-btn');
    const avatarActionModal = document.getElementById('avatar-action-modal');
    const btnAvatarUpdate = document.getElementById('btn-avatar-update');
    const btnAvatarCamera = document.getElementById('btn-avatar-camera');
    const btnAvatarRemove = document.getElementById('btn-avatar-remove');
    const btnAvatarClose = document.getElementById('btn-avatar-close');
    const profileImageInput = document.getElementById('profile-image-input');
    const profileCameraInput = document.getElementById('profile-camera-input');
    
    const cropperModal = document.getElementById('cropper-modal');
    const cropperImage = document.getElementById('cropper-image');
    const btnCancelCrop = document.getElementById('btn-cancel-crop');
    const btnSaveCrop = document.getElementById('btn-save-crop');
    
    let cropperInstance = null;
    
    const bookingCropperModal = document.getElementById('booking-cropper-modal');
    const bookingCropperImage = document.getElementById('booking-cropper-image');
    const btnCancelBookingCrop = document.getElementById('btn-cancel-booking-crop');
    const btnSaveBookingCrop = document.getElementById('btn-save-booking-crop');
    let bookingCropperInstance = null;

    if (avatarEditBtn) {
        avatarEditBtn.onclick = () => {
            avatarActionModal.style.display = 'flex';
            setTimeout(() => avatarActionModal.classList.remove('hidden'), 50);
        };
    }
    if (btnAvatarClose) {
        btnAvatarClose.onclick = () => {
            avatarActionModal.classList.add('hidden');
            setTimeout(() => avatarActionModal.style.display = 'none', 300);
        };
    }
    if (btnAvatarUpdate) {
        btnAvatarUpdate.onclick = () => {
            avatarActionModal.classList.add('hidden');
            setTimeout(() => avatarActionModal.style.display = 'none', 300);
            profileImageInput.click();
        };
    }
    let webrtcStream = null;
    const webrtcModal = document.getElementById('webrtc-camera-modal');
    const webrtcVideo = document.getElementById('webrtc-video');
    const btnWebrtcCancel = document.getElementById('btn-webrtc-cancel');
    const btnWebrtcCapture = document.getElementById('btn-webrtc-capture');

    if (btnAvatarCamera) {
        btnAvatarCamera.onclick = async () => {
            window.webrtcTarget = 'avatar';
            avatarActionModal.classList.add('hidden');
            setTimeout(() => avatarActionModal.style.display = 'none', 300);
            
            try {
                // Try back camera first, fallback to user camera if desktop
                webrtcStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).catch(() => {
                    return navigator.mediaDevices.getUserMedia({ video: true });
                });
                
                webrtcVideo.srcObject = webrtcStream;
                webrtcModal.style.display = 'flex';
                setTimeout(() => webrtcModal.classList.remove('hidden'), 50);
            } catch (err) {
                console.error("Camera error:", err);
                alert("Camera could not be accessed. Please use the Gallery option.");
            }
        };
    }
    
    if (btnWebrtcCancel) {
        btnWebrtcCancel.onclick = () => {
            if (webrtcStream) {
                webrtcStream.getTracks().forEach(track => track.stop());
                webrtcStream = null;
            }
            webrtcModal.classList.add('hidden');
            setTimeout(() => webrtcModal.style.display = 'none', 300);
        };
    }
    
    if (btnWebrtcCapture) {
        btnWebrtcCapture.onclick = () => {
            if (!webrtcStream) return;
            const canvas = document.createElement('canvas');
            canvas.width = webrtcVideo.videoWidth;
            canvas.height = webrtcVideo.videoHeight;
            canvas.getContext('2d').drawImage(webrtcVideo, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            
            if (webrtcStream) {
                webrtcStream.getTracks().forEach(track => track.stop());
                webrtcStream = null;
            }
            webrtcModal.classList.add('hidden');
            setTimeout(() => webrtcModal.style.display = 'none', 300);
            
            if (window.webrtcTarget === 'avatar') {
                cropperImage.src = dataUrl;
                cropperModal.style.display = 'flex';
                setTimeout(() => cropperModal.classList.remove('hidden'), 50);
                
                if (cropperInstance) cropperInstance.destroy();
                setTimeout(() => {
                    cropperInstance = new Cropper(cropperImage, {
                        aspectRatio: 1,
                        viewMode: 1,
                        autoCropArea: 1,
                    });
                }, 100);
            } else if (window.webrtcTarget === 'booking') {
                bookingCropperImage.src = dataUrl;
                bookingCropperModal.style.display = 'flex';
                setTimeout(() => bookingCropperModal.classList.remove('hidden'), 50);
                
                if (bookingCropperInstance) {
                    bookingCropperInstance.destroy();
                }
                
                setTimeout(() => {
                    bookingCropperInstance = new Cropper(bookingCropperImage, {
                        aspectRatio: NaN, // free cropping
                        viewMode: 1,
                        autoCropArea: 1,
                    });
                }, 100);
            }
        };
    }
    if (btnAvatarRemove) {
        btnAvatarRemove.onclick = async () => {
            avatarActionModal.classList.add('hidden');
            setTimeout(() => avatarActionModal.style.display = 'none', 300);
            
            const currentRole = window.selectedSessionRole || localStorage.getItem('selectedSessionRole');
            if (currentRole === 'admin') {
                await setDoc(doc(db, "config", "adminProfile"), { profileImage: null }, { merge: true });
                // Refresh admin profile image
                document.getElementById('profile-avatar-img').src = 'https://via.placeholder.com/150?text=Admin';
                return;
            }
            
            if (auth.currentUser) {
                const q = query(collection(db, "customers"), where("uid", "==", auth.currentUser.uid));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    await updateDoc(snap.docs[0].ref, { profileImage: null });
                    fetchAndPopulateProfile(auth.currentUser);
                }
            }
        };
    }
    
    const handleProfileFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            cropperImage.src = evt.target.result;
            cropperModal.style.display = 'flex';
            setTimeout(() => cropperModal.classList.remove('hidden'), 50);
            
            if (cropperInstance) {
                cropperInstance.destroy();
            }
            
            setTimeout(() => {
                cropperInstance = new Cropper(cropperImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 1,
                });
            }, 100);
        };
        reader.readAsDataURL(file);
    };

    if (profileImageInput) {
        profileImageInput.addEventListener('change', handleProfileFileSelect);
    }
    if (profileCameraInput) {
        profileCameraInput.addEventListener('change', handleProfileFileSelect);
    }
    
    if (btnCancelBookingCrop) {
        btnCancelBookingCrop.onclick = () => {
            if (bookingCropperInstance) bookingCropperInstance.destroy();
            bookingCropperInstance = null;
            bookingCropperModal.classList.add('hidden');
            setTimeout(() => bookingCropperModal.style.display = 'none', 300);
            if (bookImageInput) bookImageInput.value = '';
        };
    }
    
    if (btnSaveBookingCrop) {
        btnSaveBookingCrop.onclick = () => {
            if (!bookingCropperInstance) return;
            const canvas = bookingCropperInstance.getCroppedCanvas({
                width: 800,
                height: 800
            });
            compressedImageData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Update UI
            const previewEl = document.getElementById('image-preview');
            const uploadBoxEl = document.getElementById('upload-box');
            const previewContainerEl = document.getElementById('image-preview-container');
            
            if (previewEl) previewEl.src = compressedImageData;
            if (uploadBoxEl) uploadBoxEl.style.display = 'none';
            if (previewContainerEl) previewContainerEl.classList.remove('hidden');
            
            if (bookingCropperInstance) bookingCropperInstance.destroy();
            bookingCropperInstance = null;
            bookingCropperModal.classList.add('hidden');
            setTimeout(() => bookingCropperModal.style.display = 'none', 300);
        };
    }

    if (btnCancelCrop) {
        btnCancelCrop.onclick = () => {
            if (cropperInstance) cropperInstance.destroy();
            cropperInstance = null;
            cropperModal.classList.add('hidden');
            setTimeout(() => cropperModal.style.display = 'none', 300);
            profileImageInput.value = "";
        };
    }
    
    if (btnSaveCrop) {
        btnSaveCrop.onclick = async () => {
            if (!cropperInstance) return;
            const canvas = cropperInstance.getCroppedCanvas({
                width: 400,
                height: 400
            });
            const base64Img = canvas.toDataURL('image/jpeg', 0.8);
            
            const btnOriginalText = btnSaveCrop.textContent;
            btnSaveCrop.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';
            
            const currentRole = window.selectedSessionRole || localStorage.getItem('selectedSessionRole');
            if (currentRole === 'admin') {
                await setDoc(doc(db, "config", "adminProfile"), { profileImage: base64Img }, { merge: true });
                document.getElementById('profile-avatar-img').src = base64Img;
                
                btnSaveCrop.textContent = btnOriginalText;
                if (cropperInstance) cropperInstance.destroy();
                cropperInstance = null;
                cropperModal.classList.add('hidden');
                setTimeout(() => cropperModal.style.display = 'none', 300);
                if(profileImageInput) profileImageInput.value = "";
                return;
            }
            
            if (!auth.currentUser) return;
            
            // Save to Firestore
            const q = query(collection(db, "customers"), where("uid", "==", auth.currentUser.uid));
            const snap = await getDocs(q);
            if (!snap.empty) {
                await updateDoc(snap.docs[0].ref, { profileImage: base64Img });
                btnSaveCrop.textContent = btnOriginalText;
                
                // Hide modal & cleanup
                if (cropperInstance) cropperInstance.destroy();
                cropperInstance = null;
                cropperModal.classList.add('hidden');
                setTimeout(() => cropperModal.style.display = 'none', 300);
                if(profileImageInput) profileImageInput.value = "";
                
                // Refresh Profile
                fetchAndPopulateProfile(auth.currentUser);
            }
        };
    }

    // --- Booking Photo Action Modal Logic ---
    const bookingUploadBox = document.getElementById('upload-box');
    const bookingActionModal = document.getElementById('booking-action-modal');
    const btnBookingActionClose = document.getElementById('btn-booking-action-close');
    const btnBookingGallery = document.getElementById('btn-booking-gallery');
    const btnBookingCamera = document.getElementById('btn-booking-camera');
    const btnBookingRemove = document.getElementById('btn-booking-remove');
    const bookingImagePreviewContainer = document.getElementById('image-preview-container');
    const originalRemoveBtn = document.getElementById('remove-image-btn');

    const openBookingActionModal = () => {
        bookingActionModal.style.display = 'flex';
        setTimeout(() => bookingActionModal.classList.remove('hidden'), 50);
        if (btnBookingRemove) {
            btnBookingRemove.style.display = 'block';
            setTimeout(() => btnBookingRemove.classList.remove('hidden'), 10);
            
            if (bookingImagePreviewContainer && !bookingImagePreviewContainer.classList.contains('hidden')) {
                btnBookingRemove.style.opacity = '1';
                btnBookingRemove.style.pointerEvents = 'auto';
                btnBookingRemove.style.cursor = 'pointer';
            } else {
                btnBookingRemove.style.opacity = '0.5';
                btnBookingRemove.style.pointerEvents = 'none';
                btnBookingRemove.style.cursor = 'not-allowed';
            }
        }
    };
    window.openBookingActionModal = openBookingActionModal;

    if (bookingUploadBox) {
        bookingUploadBox.addEventListener('click', openBookingActionModal);
    }
    
    if (bookingImagePreviewContainer) {
        bookingImagePreviewContainer.onclick = (e) => {
            if (e.target.id !== 'remove-image-btn' && e.target.closest('#remove-image-btn') === null) {
                openBookingActionModal();
            }
        };
    }
    
    if (btnBookingActionClose) {
        btnBookingActionClose.onclick = () => {
            bookingActionModal.classList.add('hidden');
            setTimeout(() => bookingActionModal.style.display = 'none', 300);
        };
    }
    
    if (btnBookingRemove) {
        btnBookingRemove.onclick = () => {
            bookingActionModal.classList.add('hidden');
            setTimeout(() => bookingActionModal.style.display = 'none', 300);
            if (originalRemoveBtn) originalRemoveBtn.click();
        };
    }
    
    if (btnBookingGallery) {
        btnBookingGallery.onclick = () => {
            bookingActionModal.classList.add('hidden');
            setTimeout(() => bookingActionModal.style.display = 'none', 300);
            if (bookImageInput) bookImageInput.click();
        };
    }
    
    if (btnBookingCamera) {
        btnBookingCamera.onclick = async () => {
            window.webrtcTarget = 'booking';
            bookingActionModal.classList.add('hidden');
            setTimeout(() => bookingActionModal.style.display = 'none', 300);
            
            try {
                webrtcStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).catch(() => {
                    return navigator.mediaDevices.getUserMedia({ video: true });
                });
                
                webrtcVideo.srcObject = webrtcStream;
                webrtcModal.style.display = 'flex';
                setTimeout(() => webrtcModal.classList.remove('hidden'), 50);
            } catch (err) {
                console.error("Camera error:", err);
                alert("Camera could not be accessed. Please use the Gallery option.");
            }
        };
    }


// --- ADMIN FUNCTIONS ---
let unsubDashboard = null;
let unsubOrders = null;
let unsubCustomers = null;
let unsubWorkers = null;

// Cleanup function to prevent multiple listeners
window.cleanupAdminListeners = () => {
    if (unsubDashboard) { unsubDashboard(); unsubDashboard = null; }
    if (unsubOrders) { unsubOrders(); unsubOrders = null; }
    if (unsubCustomers) { unsubCustomers(); unsubCustomers = null; }
    if (unsubWorkers) { unsubWorkers(); unsubWorkers = null; }
};

window.fetchAdminDashboard = () => {
    try {
        const custQuery = query(collection(db, "customers"), where("role", "in", ["customer", "both"]));
        const workQuery = query(collection(db, "customers"), where("role", "in", ["worker", "both"]));
        
        onSnapshot(custQuery, (snap) => {
            document.getElementById('admin-total-customers').textContent = snap.size;
        });
        
        onSnapshot(workQuery, (snap) => {
            document.getElementById('admin-total-workers').textContent = snap.size;
        });
        
        onSnapshot(collection(db, "bookings"), (snap) => {
            document.getElementById('admin-total-bookings').textContent = snap.size;
        });
    } catch(e) {
        console.error("Error fetching admin dashboard:", e);
    }
};

window.fetchAdminOrders = () => {
    const list = document.getElementById('admin-orders-list');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading orders...</div>';

    if (unsubOrders) unsubOrders();

    const statusColors = {
        'Pending':        { bg: '#FFF3E0', badge: '#FF9800' },
        'Accepted':       { bg: '#E3F2FD', badge: '#1565C0' },
        'Reached':        { bg: '#EDE7F6', badge: '#7B1FA2' },
        'PaymentPending': { bg: '#FFF8E1', badge: '#FBC02D' },
        'Completed':      { bg: '#E8F5E9', badge: '#43A047' },
        'Canceled':       { bg: '#FFEBEE', badge: '#E53935' },
    };

    // Name lookup cache
    const nameCache = {};
    async function lookupName(collection_name, uid, fallback) {
        if (!uid) return fallback;
        const key = collection_name + uid;
        if (nameCache[key]) return nameCache[key];
        try {
            const q = query(collection(db, collection_name), where('uid', '==', uid));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const d = snap.docs[0].data();
                const n = d.name || d.fullName || d.displayName || d.email || fallback;
                nameCache[key] = n;
                return n;
            }
        } catch(e) {}
        return fallback;
    }

    function getTimestamp(data) {
        if (!data.timestamp) return 0;
        if (typeof data.timestamp.toMillis === 'function') return data.timestamp.toMillis();
        if (data.timestamp instanceof Date) return data.timestamp.getTime();
        if (typeof data.timestamp === 'string') return new Date(data.timestamp).getTime();
        return 0;
    }

    function formatDateKey(dateStr) {
        if (!dateStr) return 'Unknown Date';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        } catch(e) { return dateStr; }
    }

    try {
        unsubOrders = onSnapshot(collection(db, 'bookings'), async (bookingsSnap) => {
            list.innerHTML = '';

            if (bookingsSnap.empty) {
                list.innerHTML = '<div style="text-align:center;padding:30px;color:#888;"><i class="fa-solid fa-inbox" style="font-size:32px;display:block;margin-bottom:10px;"></i>No orders yet.</div>';
                return;
            }

            // Collect all docs
            const docs = [];
            bookingsSnap.forEach(d => docs.push({ id: d.id, ...d.data() }));

            // Sort by booking date descending, then by timestamp within same date
            docs.sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : getTimestamp(a);
                const dateB = b.date ? new Date(b.date).getTime() : getTimestamp(b);
                if (dateB !== dateA) return dateB - dateA;
                return getTimestamp(b) - getTimestamp(a);
            });

            // Group by date
            const grouped = {};
            const dateOrder = [];
            for (const data of docs) {
                const dateKey = data.date || 'Unknown Date';
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                    dateOrder.push(dateKey);
                }
                grouped[dateKey].push(data);
            }

            // Render each date group
            for (const dateKey of dateOrder) {
                const orders = grouped[dateKey];
                const displayDate = formatDateKey(dateKey);
                const totalOrders = orders.length;
                const completed = orders.filter(o => o.status === 'Completed').length;

                // Date section header
                const header = document.createElement('div');
                header.style.cssText = 'background:linear-gradient(135deg,#1565C0,#42A5F5); color:white; padding:12px 16px; border-radius:10px; margin-bottom:8px; margin-top:16px; display:flex; justify-content:space-between; align-items:center;';
                header.innerHTML = `
                    <div>
                        <div style="font-weight:700; font-size:14px;"><i class="fa-solid fa-calendar-days" style="margin-right:6px;"></i>${displayDate}</div>
                        <div style="font-size:11px; opacity:0.85; margin-top:2px;">${totalOrders} order${totalOrders > 1 ? 's' : ''} · ${completed} completed</div>
                    </div>
                    <span style="background:rgba(255,255,255,0.2); padding:4px 10px; border-radius:20px; font-size:12px; font-weight:700;">${totalOrders}</span>
                `;
                list.appendChild(header);

                // Orders under this date
                for (const data of orders) {
                    const sc = statusColors[data.status] || { bg: '#f5f5f5', badge: '#999' };
                    const service = data.service || '—';
                    const address = (data.address || '—').substring(0, 50);
                    const desc    = (data.description || '').substring(0, 60);

                    // Placed-at time
                    let placedTime = '';
                    try {
                        const ts = data.timestamp;
                        if (ts) {
                            const d2 = typeof ts.toDate === 'function' ? ts.toDate() : (ts instanceof Date ? ts : new Date(ts));
                            placedTime = d2.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                        }
                    } catch(e) {}

                    const custName   = await lookupName('customers', data.userId,  'Customer');
                    const workerName = data.workerId ? await lookupName('workers', data.workerId, await lookupName('customers', data.workerId, 'Worker')) : 'Not assigned';

                    const card = document.createElement('div');
                    card.className = 'order-card';
                    card.style.cssText = `background:${sc.bg}; border-left:4px solid ${sc.badge}; border-radius:10px; padding:12px 14px; margin-bottom:8px; box-shadow:0 2px 6px rgba(0,0,0,0.05);`;
                    card.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <div style="font-weight:700; font-size:14px; color:#1a1a2e;">${service}</div>
                            <span style="background:${sc.badge}; color:white; font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px;">${data.status || 'Unknown'}</span>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px 10px; font-size:12px; color:#444;">
                            <div><i class="fa-solid fa-user" style="color:${sc.badge}; width:13px;"></i> <strong>Customer:</strong> ${custName}</div>
                            <div><i class="fa-solid fa-user-tie" style="color:${sc.badge}; width:13px;"></i> <strong>Worker:</strong> ${workerName}</div>
                            <div style="grid-column:1/-1;"><i class="fa-solid fa-location-dot" style="color:${sc.badge}; width:13px;"></i> ${address}</div>
                            ${desc ? `<div style="grid-column:1/-1; color:#666;"><i class="fa-solid fa-note-sticky" style="color:${sc.badge}; width:13px;"></i> ${desc}</div>` : ''}
                        </div>
                        ${placedTime ? `<div style="margin-top:6px; font-size:11px; color:#aaa; text-align:right;"><i class="fa-solid fa-clock"></i> ${placedTime}</div>` : ''}
                    `;
                    list.appendChild(card);
                }
            }
        });
    } catch(e) {
        console.error('Error fetching admin orders:', e);
        list.innerHTML = '<div style="color:red; padding: 20px;">Error loading orders.</div>';
    }
};

window.toggleBlockUser = async (uid, newStatus) => {
    try {
        const q = query(collection(db, "customers"), where("uid", "==", uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
            await updateDoc(snap.docs[0].ref, { status: newStatus });
            // Refresh UI immediately
            if (window.fetchAdminCustomers) window.fetchAdminCustomers();
            if (window.fetchAdminWorkers) window.fetchAdminWorkers();
        } else {
            alert("User not found.");
        }
    } catch (e) {
        console.error("Error updating user status:", e);
        alert("Error updating user status: " + e.message);
    }
};

window.deleteAdminUser = async (uid) => {
    if (confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) {
        try {
            // In a purely client-side app without Admin SDK, we can only delete the profile document.
            // Note: This does not delete their Firebase Auth account.
            const q = query(collection(db, "customers"), where("uid", "==", uid));
            const snap = await getDocs(q);
            if (!snap.empty) {
                await deleteDoc(snap.docs[0].ref);
                alert("User deleted successfully.");
                // Refresh UI immediately
                if (window.fetchAdminCustomers) window.fetchAdminCustomers();
                if (window.fetchAdminWorkers) window.fetchAdminWorkers();
            } else {
                alert("User not found.");
            }
        } catch(e) {
            console.error("Error deleting user:", e);
            alert("Error deleting user: " + e.message);
        }
    }
};

window.fetchAdminCustomers = () => {
    const list = document.getElementById('admin-customers-list');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading customers...</div>';

    if (unsubCustomers) unsubCustomers();

    try {
        const q = query(collection(db, 'customers'), where('role', 'in', ['customer', 'both']));
        unsubCustomers = onSnapshot(q, (snap) => {
            list.innerHTML = '';
            if (snap.empty) {
                list.innerHTML = '<div style="text-align:center;padding:30px;color:#888;"><i class="fa-solid fa-users" style="font-size:32px;display:block;margin-bottom:10px;"></i>No customers found.</div>';
                return;
            }
            // Sort by name
            const docs = [];
            snap.forEach(d => docs.push(d.data()));
            docs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            docs.forEach((data, i) => {
                const isBlocked = data.status === 'blocked';
                const el = document.createElement('div');
                el.className = 'admin-user-card';
                el.style.cssText = 'border-left:4px solid ' + (isBlocked ? '#E53935' : '#43A047') + '; margin-bottom:10px; border-radius:10px; padding:14px; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.06); display:flex; align-items:center; gap:12px;';
                el.innerHTML = `
                    ${data.profileImage
                        ? `<img src="${data.profileImage}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid #e0e0e0;">`
                        : `<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#1565C0,#42A5F5);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid fa-user" style="color:white;font-size:22px;"></i></div>`}
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:700;font-size:15px;color:#1a1a2e;margin-bottom:4px;">${data.name || 'Unknown'}</div>
                        <div style="font-size:12px;color:#555;margin-bottom:2px;"><i class="fa-solid fa-phone" style="color:#1565C0;width:14px;"></i> ${data.phone || '—'}</div>
                        <div style="font-size:12px;color:#555;margin-bottom:2px;"><i class="fa-solid fa-location-dot" style="color:#1565C0;width:14px;"></i> ${data.location || '—'}</div>
                        <div style="font-size:12px;color:#777;"><i class="fa-solid fa-envelope" style="color:#1565C0;width:14px;"></i> ${data.email || '—'}</div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                        <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${isBlocked ? '#FFEBEE' : '#E8F5E9'};color:${isBlocked ? '#C62828' : '#2E7D32'};">${isBlocked ? 'BLOCKED' : 'ACTIVE'}</span>
                        <button onclick="window.openChatModal('${data.uid}', '${(data.name || 'Customer').replace(/'/g, "\\'")}')" style="background:var(--primary-blue);color:white;border:none;padding:5px 10px;border-radius:6px;font-size:11px;cursor:pointer;"><i class="fa-solid fa-message" style="margin-right:4px;"></i>Chat Now</button>
                        <div style="position:relative;">
                            <i class="fa-solid fa-ellipsis-vertical" style="padding:8px;cursor:pointer;color:#999;" onclick="const m=this.nextElementSibling;m.style.display=m.style.display==='block'?'none':'block';"></i>
                            <div style="display:none;position:absolute;right:0;top:100%;background:white;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.15);width:130px;z-index:50;">
                                <button onclick="window.toggleBlockUser('${data.uid}','${isBlocked ? 'active' : 'blocked'}')" style="width:100%;text-align:left;padding:10px 14px;border:none;background:none;cursor:pointer;font-size:13px;"><i class="fa-solid fa-ban" style="color:orange;margin-right:6px;"></i>${isBlocked ? 'Unblock' : 'Block'}</button>
                                <button onclick="window.deleteAdminUser('${data.uid}')" style="width:100%;text-align:left;padding:10px 14px;border:none;background:none;cursor:pointer;font-size:13px;color:#d32f2f;"><i class="fa-solid fa-trash" style="margin-right:6px;"></i>Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                list.appendChild(el);
            });
        });
    } catch(e) {
        console.error('Error fetching admin customers:', e);
        list.innerHTML = '<div style="color:red;padding:20px;">Error loading customers.</div>';
    }
};

window.fetchAdminWorkers = () => {
    const list = document.getElementById('admin-workers-list');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading workers...</div>';

    if (unsubWorkers) unsubWorkers();

    try {
        // Check workers collection first, fallback to customers with worker role
        unsubWorkers = onSnapshot(collection(db, 'workers'), async (workerSnap) => {
            list.innerHTML = '';
            let docs = [];
            workerSnap.forEach(d => docs.push(d.data()));

            // If workers collection empty, try customers collection with worker role
            if (docs.length === 0) {
                const q2 = query(collection(db, 'customers'), where('role', 'in', ['worker', 'both']));
                const snap2 = await getDocs(q2);
                snap2.forEach(d => docs.push(d.data()));
            }

            if (docs.length === 0) {
                list.innerHTML = '<div style="text-align:center;padding:30px;color:#888;"><i class="fa-solid fa-user-tie" style="font-size:32px;display:block;margin-bottom:10px;"></i>No workers found.</div>';
                return;
            }

            // Sort by name
            docs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            docs.forEach(data => {
                const isBlocked = data.status === 'blocked';
                const service = data.service || data.trade || '—';
                
                let avgRating = 0;
                let ratingCount = 0;
                if (data.ratings && data.ratings.length > 0) {
                    ratingCount = data.ratings.length;
                    const sum = data.ratings.reduce((acc, r) => acc + r.stars, 0);
                    avgRating = (sum / ratingCount).toFixed(1);
                }
                
                let ratingHtml = `<div style="font-size:12px;color:#555;margin-bottom:2px;display:flex;align-items:center;gap:4px;"><i class="fa-solid fa-star" style="color:#FFD700;"></i> ${avgRating > 0 ? `<strong>${avgRating}</strong> (${ratingCount} ratings)` : 'No ratings yet'}</div>`;
                let commentsBtnHtml = ratingCount > 0 ? `<div style="font-size:12px; margin-top:2px;"><a href="#" onclick="event.preventDefault(); window.openAdminComments('${data.uid}', '${(data.name || 'Worker').replace(/'/g, "\\'")}')" style="color:var(--primary-blue); text-decoration:underline;">View Comments</a></div>` : '';

                const el = document.createElement('div');
                el.className = 'admin-user-card';
                el.style.cssText = 'border-left:4px solid #7B1FA2; margin-bottom:10px; border-radius:10px; padding:14px; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.06); display:flex; align-items:center; gap:12px;';
                el.innerHTML = `
                    ${data.profileImage
                        ? `<img src="${data.profileImage}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid #e0e0e0;">`
                        : `<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#6A1B9A,#AB47BC);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid fa-user-tie" style="color:white;font-size:22px;"></i></div>`}
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                            <span style="font-weight:700;font-size:15px;color:#1a1a2e;">${data.name || 'Unknown'}</span>
                            <span style="font-size:10px;font-weight:700;background:#EDE7F6;color:#6A1B9A;padding:2px 8px;border-radius:20px;">${service}</span>
                        </div>
                        <div style="font-size:12px;color:#555;margin-bottom:2px;"><i class="fa-solid fa-phone" style="color:#7B1FA2;width:14px;"></i> ${data.phone || '—'}</div>
                        <div style="font-size:12px;color:#555;margin-bottom:2px;"><i class="fa-solid fa-location-dot" style="color:#7B1FA2;width:14px;"></i> ${data.location || data.city || '—'}</div>
                        <div style="font-size:12px;color:#777;margin-bottom:2px;"><i class="fa-solid fa-envelope" style="color:#7B1FA2;width:14px;"></i> ${data.email || '—'}</div>
                        ${ratingHtml}
                        ${commentsBtnHtml}
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                        <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${isBlocked ? '#FFEBEE' : '#F3E5F5'};color:${isBlocked ? '#C62828' : '#6A1B9A'};">${isBlocked ? 'BLOCKED' : 'ACTIVE'}</span>
                        <button onclick="window.openChatModal('${data.uid}', '${data.name || 'Worker'}')" style="background:var(--primary-blue);color:white;border:none;padding:5px 10px;border-radius:6px;font-size:11px;cursor:pointer;"><i class="fa-solid fa-message" style="margin-right:4px;"></i>Chat Now</button>
                        <div style="position:relative;">
                            <i class="fa-solid fa-ellipsis-vertical" style="padding:8px;cursor:pointer;color:#999;" onclick="const m=this.nextElementSibling;m.style.display=m.style.display==='block'?'none':'block';"></i>
                            <div style="display:none;position:absolute;right:0;top:100%;background:white;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.15);width:130px;z-index:50;">
                                <button onclick="window.toggleBlockUser('${data.uid}','${isBlocked ? 'active' : 'blocked'}')" style="width:100%;text-align:left;padding:10px 14px;border:none;background:none;cursor:pointer;font-size:13px;"><i class="fa-solid fa-ban" style="color:orange;margin-right:6px;"></i>${isBlocked ? 'Unblock' : 'Block'}</button>
                                <button onclick="window.deleteAdminUser('${data.uid}')" style="width:100%;text-align:left;padding:10px 14px;border:none;background:none;cursor:pointer;font-size:13px;color:#d32f2f;"><i class="fa-solid fa-trash" style="margin-right:6px;"></i>Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                list.appendChild(el);
            });
        });
    } catch(e) {
        console.error('Error fetching admin workers:', e);
        list.innerHTML = '<div style="color:red;padding:20px;">Error loading workers.</div>';
    }
};



    const adminMenuBtn = document.getElementById('admin-home-menu-btn');
    const adminMenuDropdown = document.getElementById('admin-home-dropdown-menu');
    const adminLogoutBtn = document.getElementById('admin-home-logout-btn');
    
    if (adminMenuBtn && adminMenuDropdown) {
        adminMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (adminMenuDropdown.style.display === 'none') {
                adminMenuDropdown.style.display = 'block';
                adminMenuDropdown.classList.remove('hidden');
            } else {
                adminMenuDropdown.style.display = 'none';
                adminMenuDropdown.classList.add('hidden');
            }
        });
        
        document.addEventListener('click', () => {
            adminMenuDropdown.style.display = 'none';
            adminMenuDropdown.classList.add('hidden');
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.selectedSessionRole = null;
                localStorage.removeItem('selectedSessionRole');
                location.reload();
            });
        });
    }
// --- VISUAL CALENDAR LOGIC ---
let currentDate = new Date();

function renderCalendar() {
    const monthYear = document.getElementById('calendar-month-year');
    const grid = document.getElementById('calendar-grid');
    if (!monthYear || !grid) return;

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYear.innerText = `${monthNames[month]} ${year}`;

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    grid.innerHTML = '';
    
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        grid.appendChild(emptyDiv);
    }

    const today = new Date();
    
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.innerText = i;
        dayDiv.style.padding = '8px 0';
        dayDiv.style.borderRadius = '50%';
        dayDiv.style.cursor = 'pointer';
        dayDiv.style.fontSize = '14px';

        // Check if today
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.style.backgroundColor = 'var(--primary-blue)';
            dayDiv.style.color = 'white';
            dayDiv.style.fontWeight = 'bold';
        } else {
            dayDiv.style.color = '#333';
        }

        // On click, set it to the leave date input if it exists
        dayDiv.addEventListener('click', () => {
            const leaveDateInput = document.getElementById('leave-date');
            if (leaveDateInput) {
                // format YYYY-MM-DD
                const m = String(month + 1).padStart(2, '0');
                const d = String(i).padStart(2, '0');
                leaveDateInput.value = `${year}-${m}-${d}`;
                
                // Highlight selected
                document.querySelectorAll('#calendar-grid div').forEach(el => {
                    if(el.style.backgroundColor === 'var(--primary-blue)') {
                        // don't remove today's highlight completely but reset others
                        if (el.innerText != today.getDate()) {
                            el.style.backgroundColor = 'transparent';
                            el.style.color = '#333';
                        }
                    } else if (el.style.backgroundColor === 'rgb(238, 238, 238)') {
                        el.style.backgroundColor = 'transparent';
                    }
                });
                
                if (dayDiv.style.backgroundColor !== 'var(--primary-blue)') {
                    dayDiv.style.backgroundColor = '#eee';
                }
            }
        });

        grid.appendChild(dayDiv);
    }
}

function attachCalendarListeners() {
    const prev = document.getElementById('calendar-prev-month');
    const next = document.getElementById('calendar-next-month');
    
    if (prev) {
        prev.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (next) {
        next.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
}

// Ensure listeners are attached once
setTimeout(() => {
    attachCalendarListeners();
    renderCalendar();
}, 1000);
// --- LEAVE MANAGEMENT LOGIC ---

function attachLeaveManagementListeners() {
    const leaveTypeSelect = document.getElementById('leave-type');
    const halfDayGroup = document.getElementById('half-day-timing-group');
    const submitLeaveBtn = document.getElementById('submit-leave-btn');
    const cancelLeaveBtn = document.getElementById('cancel-leave-btn');
    
    // Set default date to today
    const dateInput = document.getElementById('leave-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    if (leaveTypeSelect) {
        leaveTypeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Half Day') {
                halfDayGroup.style.display = 'block';
            } else {
                halfDayGroup.style.display = 'none';
            }
        });
    }

    if (submitLeaveBtn) {
        submitLeaveBtn.addEventListener('click', async () => {
            if (!auth.currentUser) return;
            const date = document.getElementById('leave-date').value;
            const type = document.getElementById('leave-type').value;
            const timing = document.getElementById('leave-timing').value.trim();
            const reason = document.getElementById('leave-reason').value.trim();

            if (!date) return alert("Please select a date.");
            if (!reason) return alert("Please provide a reason for your leave.");
            if (type === 'Half Day' && !timing) return alert("Please specify the timing for your half-day leave.");

            const originalText = submitLeaveBtn.innerHTML;
            submitLeaveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
            submitLeaveBtn.disabled = true;

            try {
                const leaveData = {
                    active: true,
                    date: date,
                    type: type,
                    timing: type === 'Half Day' ? timing : '',
                    reason: reason
                };
                const historyEntry = { ...leaveData, status: 'Taken', timestamp: new Date().toISOString() };
                
                const qSubmit = query(collection(db, "customers"), where("uid", "==", auth.currentUser.uid));
                const snapSubmit = await getDocs(qSubmit);
                if (snapSubmit.empty) throw new Error("Worker profile not found in database.");
                const docRefSubmit = snapSubmit.docs[0].ref;
                await updateDoc(docRefSubmit, {
                    leave: leaveData,
                    leaveHistory: arrayUnion(historyEntry)
                });
                alert("Leave submitted successfully.");
                fetchAndPopulateWorkerLeave(auth.currentUser.uid); // Refresh UI
                document.getElementById('leave-reason').value = '';
                document.getElementById('leave-timing').value = '';
            } catch (error) {
                console.error("Error submitting leave: ", error);
                alert("Error submitting leave: " + error.message);
            } finally {
                submitLeaveBtn.innerHTML = originalText;
                submitLeaveBtn.disabled = false;
            }
        });
    }

    if (cancelLeaveBtn) {
        cancelLeaveBtn.addEventListener('click', async () => {
            if (!auth.currentUser) return;
            
            const originalText = cancelLeaveBtn.innerHTML;
            cancelLeaveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Canceling...';
            cancelLeaveBtn.disabled = true;

            try {
                const q = query(collection(db, "customers"), where("uid", "==", auth.currentUser.uid));
                const snap = await getDocs(q);
                let currentLeave = {};
                if (!snap.empty) {
                    currentLeave = snap.docs[0].data().leave || {};
                }
                if (!currentLeave.active) {
                    alert("You do not have any active leave to cancel.");
                    cancelLeaveBtn.innerHTML = originalText;
                    cancelLeaveBtn.disabled = false;
                    return;
                }
                const historyEntry = { ...currentLeave, status: 'Canceled', timestamp: new Date().toISOString() };
                
                await updateDoc(snap.docs[0].ref, {
                leave: {
                    active: false,
                    date: '',
                    type: '',
                    timing: '',
                    reason: ''
                },
                leaveHistory: arrayUnion(historyEntry)
            });
                alert("You are now back to work.");
                fetchAndPopulateWorkerLeave(auth.currentUser.uid); // Refresh UI
            } catch (error) {
                console.error("Error canceling leave: ", error);
                alert("Error canceling leave: " + error.message);
            } finally {
                cancelLeaveBtn.innerHTML = originalText;
                cancelLeaveBtn.disabled = false;
            }
        });
    }
}

async function fetchAndPopulateWorkerLeave(uid) {
    try {
        const q = query(collection(db, "customers"), where("uid", "==", uid));
        const snap = await getDocs(q);
        if (snap.empty) return;
        const d = snap.docs[0].data();

        const form = document.getElementById('take-leave-form');
        const statusWidget = document.getElementById('active-leave-status');
        const detailsText = document.getElementById('active-leave-details');

        if (!form || !statusWidget) return;

        const today = new Date().toISOString().split('T')[0];

        if (d.leave && d.leave.active && d.leave.date >= today) { // Show if active and date is today or future
            form.style.display = 'none';
            statusWidget.style.display = 'block';
            
            let timingText = d.leave.type === 'Half Day' ? ` (${d.leave.timing})` : '';
            detailsText.innerHTML = `
                <b>Date:</b> ${d.leave.date}<br>
                <b>Type:</b> ${d.leave.type}${timingText}<br>
                <b>Reason:</b> ${d.leave.reason}
            `;
        } else {
            form.style.display = 'block';
            statusWidget.style.display = 'none';
        }
    } catch (e) {
        console.error("Error fetching leave status", e);
    }
}

// Ensure listeners are attached once
setTimeout(attachLeaveManagementListeners, 1000);


// --- DARK MODE LOGIC ---
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}

// Ensure avatar buttons actually show
const avatarEditBtnSafe = document.getElementById('avatar-edit-btn');
const avatarActionModalSafe = document.getElementById('avatar-action-modal');
if (avatarEditBtnSafe && avatarActionModalSafe) {
    // Re-bind to ensure it works
    avatarEditBtnSafe.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        avatarActionModalSafe.style.display = 'flex';
        setTimeout(() => avatarActionModalSafe.classList.remove('hidden'), 50);
        // Force high z-index and explicit display on the action modal content
        avatarActionModalSafe.style.zIndex = '9999';
    });
}



// --- LEAVE HISTORY & WORKER MENUS ---
document.addEventListener('DOMContentLoaded', () => {
    // We already have a global click listener in script.js but let's just use event delegation
});

document.addEventListener('click', async (e) => {
    // 3-dot menus
    const workerDashboardDots = document.getElementById('worker-dashboard-menu-dots');
    const workerDashboardDropdown = document.getElementById('worker-dashboard-dropdown');
    
    if (e.target === workerDashboardDots) {
        if (workerDashboardDropdown) {
            workerDashboardDropdown.style.display = workerDashboardDropdown.style.display === 'none' ? 'block' : 'none';
            workerDashboardDropdown.classList.toggle('hidden');
        }
    } else if (workerDashboardDropdown && !workerDashboardDropdown.contains(e.target)) {
        workerDashboardDropdown.style.display = 'none';
        workerDashboardDropdown.classList.add('hidden');
    }

    const leaveMenuDots = document.getElementById('leave-menu-dots');
    const leaveMenuDropdown = document.getElementById('leave-menu-dropdown');

    if (e.target === leaveMenuDots) {
        if (leaveMenuDropdown) {
            leaveMenuDropdown.style.display = leaveMenuDropdown.style.display === 'none' ? 'block' : 'none';
            leaveMenuDropdown.classList.toggle('hidden');
        }
    } else if (leaveMenuDropdown && !leaveMenuDropdown.contains(e.target) && e.target.id !== 'cancel-leave-btn' && e.target.id !== 'go-to-work-btn') {
        leaveMenuDropdown.style.display = 'none';
        leaveMenuDropdown.classList.add('hidden');
    }

    // Leave History btn
    if (e.target.closest('#worker-leave-history-btn') || e.target.closest('#home-leave-history-btn')) {
        const modal = document.getElementById('leave-history-modal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.remove('hidden'), 50);
            fetchAndPopulateLeaveHistory(auth.currentUser.uid);
        }
    }

    // Close Leave History modal
    if (e.target.closest('#close-leave-history-modal') || e.target.closest('#btn-leave-history-close')) {
        const modal = document.getElementById('leave-history-modal');
        if (modal) {
            modal.classList.add('hidden');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    }

    // Worker Logout btn
    if (e.target.closest('#worker-logout-btn')) {
        try {
            await signOut(auth);
            window.location.reload();
        } catch (error) {
            console.error("Logout Error:", error);
            alert("Error logging out.");
        }
    }

    // "I will go work" btn
    if (e.target.closest('#go-to-work-btn')) {
        const btn = e.target.closest('#go-to-work-btn');
        if (!auth.currentUser) return;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        try {
            const q = query(collection(db, "customers"), where("uid", "==", auth.currentUser.uid));
            const snap = await getDocs(q);
            let currentLeave = {};
            if (!snap.empty) {
                currentLeave = snap.docs[0].data().leave || {};
            }
            const historyEntry = { ...currentLeave, status: 'Returned to Work', timestamp: new Date().toISOString() };
            
            await updateDoc(snap.docs[0].ref, {
                leave: {
                    active: false,
                    date: '',
                    type: '',
                    timing: '',
                    reason: ''
                },
                leaveHistory: arrayUnion(historyEntry)
            });
            alert("You are now back to work. Customers can book you again.");
            if (typeof fetchAndPopulateWorkerLeave === 'function') {
                fetchAndPopulateWorkerLeave(auth.currentUser.uid);
            }
        } catch (error) {
            console.error("Error returning to work: ", error);
            alert("Error processing request.");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
});

async function fetchAndPopulateLeaveHistory(uid) {
    const listDiv = document.getElementById('leave-history-list');
    if (!listDiv) return;
    
    listDiv.innerHTML = '<p style="color: #888; text-align: center; font-size: 14px;">Loading...</p>';
    
    try {
        const q = query(collection(db, "customers"), where("uid", "==", uid));
        const snap = await getDocs(q);
        if (snap.empty) {
            listDiv.innerHTML = '<p style="color: #888; text-align: center; font-size: 14px;">No history found.</p>';
            return;
        }
        
        const data = snap.docs[0].data();
        let history = data.leaveHistory || [];
        
        if (history.length === 0) {
            listDiv.innerHTML = '<p style="color: #888; text-align: center; font-size: 14px;">No leave history found.</p>';
            return;
        }
        
        // Sort by timestamp desc
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        let html = '';
        history.forEach(item => {
            const dateStr = item.date || 'Unknown Date';
            let color = '#333';
            let bg = '#f9f9f9';
            if (item.status === 'Canceled') { color = '#d32f2f'; bg = '#ffebee'; }
            if (item.status === 'Returned to Work') { color = '#2e7d32'; bg = '#e8f5e9'; }
            if (item.status === 'Taken') { color = '#1976d2'; bg = '#e3f2fd'; }
            
            html += `
                <div style="border: 1px solid #eee; padding: 12px; border-radius: 8px; font-size: 13px; background: ${bg};">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <strong>${dateStr}</strong>
                        <span style="color: ${color}; font-weight: 600;">${item.status}</span>
                    </div>
                    <div style="color: #555;">Type: ${item.type} ${item.timing ? '('+item.timing+')' : ''}</div>
                    <div style="color: #555;">Reason: ${item.reason}</div>
                    <div style="font-size: 11px; color: #999; margin-top: 5px; text-align: right;">Logged: ${new Date(item.timestamp).toLocaleString()}</div>
                </div>
            `;
        });
        listDiv.innerHTML = html;
        
    } catch (e) {
        console.error("Error fetching leave history", e);
        listDiv.innerHTML = '<p style="color: red; text-align: center; font-size: 14px;">Failed to load history.</p>';
    }
}


// Stub for fetchAdminDashboard to prevent ReferenceError
window.fetchAdminDashboard = async function() {
    console.log('fetchAdminDashboard called');
};


// ==========================================
// DYNAMIC SERVICES MANAGEMENT
// ==========================================
const DEFAULT_SERVICES = [
    { name: "Plumbing", icon: "🔧", image: "service_plumber_1787641527684.jpg" },
    { name: "Electrical", icon: "⚡", image: "service_electrician_1787641544945.jpg" },
    { name: "AC Repair", icon: "❄️", image: "service_ac_repair_1787641677058.jpg" },
    { name: "Carpentry", icon: "🪚", image: "service_carpenter_1787641755840.jpg" },
    { name: "Car Wash", icon: "🚗", image: "service_carwash.jpg" },
    { name: "House Painting", icon: "🎨", image: "service_painting.jpg" },
    { name: "Home Cleaning", icon: "🧹", image: "service_cleaning.jpg" }
];

// Render all grids from a docs snapshot
function renderServicesFromDocs(docs) {
    const customerGrid = document.getElementById('service-categories-grid');
    const adminGrid    = document.getElementById('admin-service-categories-grid');
    const workerSelect = document.getElementById('worker-reg-service');

    let customerHtml = '';
    let adminHtml    = '';
    let workerHtml   = '<option value="" disabled selected>Select your trade</option>';

    docs.forEach(docSnap => {
        const svc = docSnap.data();
        const id  = docSnap.id;
        const imgSrc = svc.image && svc.image.startsWith('data:') ? svc.image : svc.image;

        customerHtml += `
            <div class="service-category-tile" data-service="${svc.name}">
                <div class="sct-img" style="background-image: url('${imgSrc}');"></div>
                <div class="sct-label">${svc.icon} ${svc.name}</div>
            </div>`;

        adminHtml += `
            <div class="service-category-tile" style="position:relative;">
                <div class="sct-img" style="background-image: url('${imgSrc}');"></div>
                <div class="sct-label">${svc.icon} ${svc.name}</div>
                <button class="delete-svc-btn" data-id="${id}" style="position:absolute; top:5px; right:5px; background:red; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:12px; font-weight:bold;">X</button>
            </div>`;

        workerHtml += `<option value="${svc.name}">${svc.icon} ${svc.name}</option>`;
    });

    if (customerGrid) {
        customerGrid.innerHTML = customerHtml;
        customerGrid.querySelectorAll('.service-category-tile').forEach(tile => {
            tile.onclick = () => {
                const service = tile.getAttribute('data-service');
                const liveLocation = document.getElementById('home-location-display')?.textContent?.trim() || (typeof currentCustomerLocation !== 'undefined' ? currentCustomerLocation : 'Unknown Location');
                currentCustomerLocation = liveLocation;
                window.currentCustomerLocation = liveLocation;
                customerGrid.querySelectorAll('.service-category-tile').forEach(t => t.classList.remove('selected'));
                tile.classList.add('selected');
                customerGrid.closest('.services-section').style.display = 'none';
                const workersSection = document.getElementById('service-workers-section');
                workersSection.style.display = 'block';
                document.getElementById('service-workers-title').textContent = service + ' Workers in ' + liveLocation;
                if (window.fetchWorkersByService) window.fetchWorkersByService(liveLocation, service);
            };
        });
    }

    if (adminGrid) {
        adminGrid.innerHTML = adminHtml;
        adminGrid.querySelectorAll('.delete-svc-btn').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this service?')) {
                    const id = btn.getAttribute('data-id');
                    await deleteDoc(doc(db, 'services', id));
                    // Real-time listener will auto-refresh all grids
                }
            };
        });
    }

    if (workerSelect) workerSelect.innerHTML = workerHtml;
}

// Real-time listener — auto-updates customer, worker & admin grids on any add/delete
let _servicesUnsubscribe = null;
window.loadAndRenderServices = async function() {
    const servicesRef = collection(db, 'services');

    // Seed defaults if empty
    try {
        const snap = await getDocs(servicesRef);
        if (snap.empty) {
            console.log('Seeding default services...');
            for (const svc of DEFAULT_SERVICES) await addDoc(servicesRef, svc);
        }
    } catch (e) { console.error('Seed error', e); }

    // Unsubscribe previous listener if any
    if (_servicesUnsubscribe) _servicesUnsubscribe();

    // Subscribe to real-time updates
    _servicesUnsubscribe = onSnapshot(servicesRef, (snapshot) => {
        renderServicesFromDocs(snapshot.docs);
    }, (error) => {
        console.error('Services listener error:', error);
    });
};

// Hook into load
setTimeout(() => {
    if (window.loadAndRenderServices) window.loadAndRenderServices();
}, 1000);

// Admin Add Service Logic — now with image file picker
document.addEventListener('DOMContentLoaded', () => {
    const addSvcBtn = document.getElementById('admin-add-service-btn');
    const fabBtn    = document.getElementById('admin-fab-btn');
    const modal     = document.getElementById('add-service-modal');
    const cancelBtn = document.getElementById('add-svc-cancel');
    const saveBtn   = document.getElementById('add-svc-save');
    const fileInput = document.getElementById('add-svc-file');

    // Store selected image base64
    let selectedImageBase64 = '';

    // File picker change handler — show preview
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                selectedImageBase64 = e.target.result; // base64 data URL
                const thumb   = document.getElementById('add-svc-img-thumb');
                const preview = document.getElementById('add-svc-img-preview');
                const nameEl  = document.getElementById('add-svc-img-name');
                const chooseBtn = document.getElementById('add-svc-choose-img-btn');
                if (thumb)   thumb.src = selectedImageBase64;
                if (preview) preview.style.display = 'block';
                if (nameEl)  nameEl.textContent = file.name;
                if (chooseBtn) chooseBtn.innerHTML = '<i class="fa-solid fa-check" style="color:green"></i> Image selected';
            };
            reader.readAsDataURL(file);
        });
    }

    function openModal() {
        // Reset modal
        selectedImageBase64 = '';
        if (document.getElementById('add-svc-name'))  document.getElementById('add-svc-name').value = '';
        if (document.getElementById('add-svc-icon'))  document.getElementById('add-svc-icon').value = '';
        if (fileInput) fileInput.value = '';
        const preview   = document.getElementById('add-svc-img-preview');
        const chooseBtn = document.getElementById('add-svc-choose-img-btn');
        if (preview)   preview.style.display = 'none';
        if (chooseBtn) chooseBtn.innerHTML = '<i class="fa-solid fa-image"></i> Choose Image from Device';
        if (modal) modal.style.display = 'flex';
    }

    if (addSvcBtn && modal) addSvcBtn.addEventListener('click', openModal);
    if (fabBtn    && modal) fabBtn.addEventListener('click', openModal);
    if (cancelBtn)          cancelBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const name = (document.getElementById('add-svc-name')?.value || '').trim();
            const icon = (document.getElementById('add-svc-icon')?.value || '').trim();

            if (!name || !icon) {
                alert('Please fill Service Name and Emoji Icon');
                return;
            }
            if (!selectedImageBase64) {
                alert('Please choose a service image');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';

            try {
                await addDoc(collection(db, 'services'), { name, icon, image: selectedImageBase64 });
                // Real-time listener auto-refreshes all grids instantly
                if (modal) modal.style.display = 'none';
            } catch (error) {
                console.error(error);
                alert('Error saving service: ' + error.message);
            }

            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Service';
        });
    }
});



document.addEventListener('DOMContentLoaded', () => {
        
    const customerSearch = document.getElementById('admin-search-customers');
    if (customerSearch) {
        customerSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('#admin-customers-list .admin-user-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }

        
    const workerSearch = document.getElementById('admin-search-workers');
    if (workerSearch) {
        workerSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('#admin-workers-list .admin-user-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }

        
    const orderSearch = document.getElementById('admin-search-orders');
    if (orderSearch) {
        orderSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('#admin-orders-list .order-card, #admin-orders-list .admin-user-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }

    // --- CHAT SYSTEM LOGIC ---
    let unsubChat = null;
    let unsubInbox = null;
    let currentChatDocId = null;

    window.openAdminSupportChat = async () => {
        try {
            const adminProfileDoc = await getDoc(doc(db, "config", "adminProfile"));
            if (adminProfileDoc.exists() && adminProfileDoc.data().uid) {
                window.openChatModal(adminProfileDoc.data().uid, 'Admin Support');
            } else {
                alert("Support is currently offline. Please try again later.");
                window.openInboxModal();
            }
        } catch (e) {
            console.error("Error fetching admin support info:", e);
            window.openInboxModal();
        }
    };

    window.openChatModal = (otherUid, otherName) => {
        const modal = document.getElementById('chat-modal');
        const title = document.getElementById('chat-modal-title');
        const container = document.getElementById('chat-messages-container');
        
        if (!modal || !auth.currentUser) return;
        
        const myUid = auth.currentUser.uid;
        const myRole = window.selectedSessionRole || localStorage.getItem('selectedSessionRole') || 'customer';
        const myName = myRole === 'admin' ? 'Admin' : (auth.currentUser.displayName || 'User');
        
        // Generate consistent chat ID (alphabetical sort)
        currentChatDocId = myUid < otherUid ? `chat_${myUid}_${otherUid}` : `chat_${otherUid}_${myUid}`;
        
        title.textContent = `Chat with ${otherName}`;
        modal.style.display = 'flex';
        container.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i></div>';
        
        if (unsubChat) unsubChat();
        
        const chatRef = doc(db, 'chats', currentChatDocId);
        
        unsubChat = onSnapshot(chatRef, async (snapshot) => {
            if (!snapshot.exists()) {
                // Initialize the chat document structure if it doesn't exist yet
                await setDoc(chatRef, {
                    participants: [myUid, otherUid],
                    names: {
                        [myUid]: myName,
                        [otherUid]: otherName
                    },
                    messages: []
                });
                container.innerHTML = '<div style="text-align:center; padding:20px; color:#888; font-size: 13px;">No messages yet. Send a message to start!</div>';
                return;
            }
            
            const data = snapshot.data();
            
            // Auto-delete expired chats
            if (data.expiresAt && data.expiresAt < Date.now()) {
                await deleteDoc(doc(db, 'chats', currentChatDocId)).catch(e => {});
                container.innerHTML = '<div style="text-align:center; padding:20px; color:#888; font-size: 13px;">This chat has expired and been deleted.</div>';
                return;
            }
            
            const msgs = data.messages || [];
            
            container.innerHTML = '';
            if (msgs.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding:20px; color:#888; font-size: 13px;">No messages yet. Send a message to start!</div>';
            } else {
                msgs.forEach(m => {
                    const el = document.createElement('div');
                    let isMyMsg = false;
                    if (myUid === otherUid && m.role) {
                        isMyMsg = (m.role === myRole);
                    } else {
                        isMyMsg = (m.sender === myUid);
                    }
                    el.className = `chat-bubble ${isMyMsg ? 'user' : 'admin'}`;
                    el.textContent = m.text;
                    container.appendChild(el);
                });
                container.scrollTop = container.scrollHeight;
            }
        });
    };
    
    window.openInboxModal = () => {
        const modal = document.getElementById('inbox-modal');
        const container = document.getElementById('inbox-list-container');
        
        if (!modal || !auth.currentUser) {
            alert("Please log in to view messages.");
            return;
        }
        
        const myUid = auth.currentUser.uid;
        modal.style.display = 'flex';
        container.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i></div>';
        
        if (unsubInbox) unsubInbox();
        
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', myUid));
        
        unsubInbox = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                container.innerHTML = '<div style="text-align:center; padding:30px; color:#888;">No conversations yet.</div>';
                return;
            }
            
            let chatsArray = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (data.expiresAt && data.expiresAt < Date.now()) {
                    deleteDoc(doc(db, 'chats', docSnap.id)).catch(e => {});
                    return; // Skip rendering
                }
                if (data.messages && data.messages.length > 0) {
                    chatsArray.push({ id: docSnap.id, ...data });
                }
            });
            
            container.innerHTML = '<div style="text-align: center; font-size: 11px; color: #888; padding: 5px 0 10px 0; border-bottom: 1px solid #f0f0f0; margin-bottom: 5px;">Tap a conversation below to open chat</div>';
            
            if (chatsArray.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding:30px; color:#888;">No conversations yet.</div>';
                return;
            }
            
            // Sort by latest message timestamp
            chatsArray.sort((a, b) => {
                const lastA = a.messages[a.messages.length - 1].timestamp;
                const lastB = b.messages[b.messages.length - 1].timestamp;
                return lastB - lastA;
            });
            
            chatsArray.forEach(chat => {
                const otherUid = chat.participants.find(uid => uid !== myUid);
                const otherName = chat.names ? chat.names[otherUid] : 'User';
                const lastMsg = chat.messages[chat.messages.length - 1];
                
                const isMyMsg = (myUid === otherUid && lastMsg.role) ? (lastMsg.role === myRole) : (lastMsg.sender === myUid);
                
                const el = document.createElement('div');
                el.className = 'inbox-item';
                el.innerHTML = `
                    <div class="inbox-item-avatar">${otherName.charAt(0).toUpperCase()}</div>
                    <div class="inbox-item-details">
                        <div class="inbox-item-name">${otherName}</div>
                        <div class="inbox-item-preview">${isMyMsg ? 'You: ' : ''}${lastMsg.text}</div>
                    </div>
                    <div style="color: #bbb; font-size: 14px; padding-left: 10px;">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                `;
                el.onclick = () => {
                    modal.style.display = 'none';
                    window.openChatModal(otherUid, otherName);
                };
                container.appendChild(el);
            });
        });
    };

    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input-field');
    
    if (chatSendBtn && chatInput) {
        const handleSend = async () => {
            const text = chatInput.value.trim();
            if (!text || !currentChatDocId || !auth.currentUser) return;
            
            const myRole = window.selectedSessionRole || localStorage.getItem('selectedSessionRole') || 'customer';
            const chatRef = doc(db, 'chats', currentChatDocId);
            const msgObj = {
                sender: auth.currentUser.uid,
                role: myRole,
                text: text,
                timestamp: Date.now()
            };
            
            chatInput.value = '';
            
            try {
                await setDoc(chatRef, {
                    messages: arrayUnion(msgObj)
                }, { merge: true });
            } catch (e) {
                console.error("Error sending message:", e);
                alert("Failed to send message");
            }
        };
        chatSendBtn.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    const chatCloseBtn = document.getElementById('chat-close-btn');
    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => {
            document.getElementById('chat-modal').style.display = 'none';
            if (unsubChat) unsubChat();
            currentChatDocId = null;
        });
    }
    
    const inboxCloseBtn = document.getElementById('inbox-close-btn');
    if (inboxCloseBtn) {
        inboxCloseBtn.addEventListener('click', () => {
            document.getElementById('inbox-modal').style.display = 'none';
            if (unsubInbox) unsubInbox();
        });
    }
    
    const homeMsgBtn = document.getElementById('home-msg-btn');
    if (homeMsgBtn) {
        homeMsgBtn.addEventListener('click', () => {
            window.openInboxModal();
        });
    }

    const blockedChatBtn = document.getElementById('blocked-chat-btn');
    if (blockedChatBtn) {
        blockedChatBtn.addEventListener('click', async () => {
            window.openAdminSupportChat();
        });
    }

    const blockedLogoutBtn = document.getElementById('blocked-logout-btn');
    if (blockedLogoutBtn) {
        blockedLogoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.selectedSessionRole = null;
                localStorage.removeItem('selectedSessionRole');
                window.location.reload();
            } catch (error) {
                console.error("Logout Error:", error);
                alert("Error logging out.");
            }
        });
    }

    // --- RATING SYSTEM LOGIC ---
    let currentRatingBookingId = null;
    let currentRatingWorkerId = null;
    let currentRatingStars = 0;

    window.openRatingModal = (bookingId, workerId) => {
        currentRatingBookingId = bookingId;
        currentRatingWorkerId = workerId;
        currentRatingStars = 0;
        
        // Reset stars
        document.querySelectorAll('#rating-stars-container i').forEach(star => {
            star.style.color = '#ddd';
        });
        document.getElementById('rating-label').textContent = 'Select a rating';
        document.getElementById('rating-comment').value = '';
        
        document.getElementById('rating-modal').style.display = 'flex';
    };

    document.getElementById('btn-rating-close')?.addEventListener('click', () => {
        document.getElementById('rating-modal').style.display = 'none';
    });

    const ratingLabels = {
        1: 'Bad',
        2: 'Average',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    document.querySelectorAll('#rating-stars-container i').forEach(star => {
        star.addEventListener('click', (e) => {
            const val = parseInt(e.target.getAttribute('data-val'));
            currentRatingStars = val;
            
            document.querySelectorAll('#rating-stars-container i').forEach(s => {
                const sVal = parseInt(s.getAttribute('data-val'));
                s.style.color = sVal <= val ? '#FFD700' : '#ddd';
            });
            
            document.getElementById('rating-label').textContent = ratingLabels[val];
        });
    });

    document.getElementById('btn-rating-submit')?.addEventListener('click', async () => {
        if (currentRatingStars === 0) {
            alert('Please select a rating star first.');
            return;
        }
        if (!currentRatingBookingId || !currentRatingWorkerId) return;

        const commentText = document.getElementById('rating-comment').value.trim();
        const submitBtn = document.getElementById('btn-rating-submit');
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        try {
            const customerName = auth.currentUser?.displayName || 'Customer';

            const ratingData = {
                stars: currentRatingStars,
                comment: commentText,
                customerName: customerName,
                bookingId: currentRatingBookingId,
                date: new Date().toISOString()
            };

            let workerRef = doc(db, 'customers', currentRatingWorkerId);
            let workerDocSnap = await getDoc(workerRef);
            if (!workerDocSnap.exists()) {
                workerRef = doc(db, 'workers', currentRatingWorkerId);
                workerDocSnap = await getDoc(workerRef);
            }
            
            if (workerDocSnap.exists()) {
                await updateDoc(workerRef, {
                    ratings: arrayUnion(ratingData)
                });
            } else {
                console.warn('Worker document not found, creating in customers collection to save rating.');
                await updateDoc(doc(db, 'customers', currentRatingWorkerId), {
                    ratings: arrayUnion(ratingData)
                }).catch(async () => {
                    // Fallback if document really doesn't exist
                    await setDoc(doc(db, 'customers', currentRatingWorkerId), {
                        ratings: arrayUnion(ratingData)
                    }, { merge: true });
                });
            }

            const bookingRef = doc(db, 'bookings', currentRatingBookingId);
            await updateDoc(bookingRef, {
                isRated: true
            });

            document.getElementById('rating-modal').style.display = 'none';
            alert('Thank you! Your rating has been submitted.');
            
            // Re-fetch history to remove the rating button
            if (auth.currentUser) fetchHistory(auth.currentUser.uid);

        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again.');
        } finally {
            submitBtn.innerHTML = 'Submit Rating';
            submitBtn.disabled = false;
        }
    });

    // Admin Comments Logic
    window.openAdminComments = async (workerId, workerName) => {
        const modal = document.getElementById('admin-comments-modal');
        const listContainer = document.getElementById('admin-comments-list');
        listContainer.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';
        modal.style.display = 'flex';

        try {
            let workerDoc = await getDoc(doc(db, 'customers', workerId));
            if (!workerDoc.exists()) {
                workerDoc = await getDoc(doc(db, 'workers', workerId));
            }
            
            if (workerDoc.exists()) {
                const data = workerDoc.data();
                const ratings = data.ratings || [];
                
                if (ratings.length === 0) {
                    listContainer.innerHTML = '<div style="text-align:center; padding:30px; color:#888;">No ratings or comments yet.</div>';
                    return;
                }

                ratings.sort((a, b) => new Date(b.date) - new Date(a.date));

                let html = '';
                ratings.forEach(r => {
                    let starsHtml = '';
                    for (let i = 1; i <= 5; i++) {
                        starsHtml += `<i class="fa-solid fa-star" style="color: ${i <= r.stars ? '#FFD700' : '#ddd'}; font-size: 12px;"></i>`;
                    }
                    
                    const dateStr = new Date(r.date).toLocaleDateString();
                    html += `
                        <div style="padding: 15px; border-bottom: 1px solid #f0f0f0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <strong style="font-size: 14px; color: #333;">${r.customerName}</strong>
                                <span style="font-size: 12px; color: #999;">${dateStr}</span>
                            </div>
                            <div style="margin-bottom: 8px;">${starsHtml} <span style="font-size: 12px; color: #666; margin-left: 5px;">${ratingLabels[r.stars] || ''}</span></div>
                            <div style="font-size: 14px; color: #555; line-height: 1.4;">${r.comment || '<i>No comment</i>'}</div>
                        </div>
                    `;
                });
                
                listContainer.innerHTML = html;
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: red;">Error loading comments.</div>';
        }
    };

    document.getElementById('btn-comments-close')?.addEventListener('click', () => {
        document.getElementById('admin-comments-modal').style.display = 'none';
    });

});
