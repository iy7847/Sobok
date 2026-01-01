// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCnHv6nMvoRMV7LtFC3HYjX2XufY7Yh5_E",
    authDomain: "sobok-push-d6469.firebaseapp.com",
    projectId: "sobok-push-d6469",
    storageBucket: "sobok-push-d6469.firebasestorage.app",
    messagingSenderId: "823086602178",
    appId: "1:823086602178:web:f7f6c10fb8166f0bc9a85b",
    measurementId: "G-S4Q77C0GEJ"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const { title, body } = payload.data;

    const notificationTitle = title;
    const notificationOptions = {
        body: body,
        icon: '/logo.png', // Ensure you have a logo in public folder or use absolute URL
        data: payload.data // Pass data to the notification (needed for click event)
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click received.');
    event.notification.close();

    // Define the URL to open
    // Since we are in the Service Worker, we construct the absolute URL.
    // Assuming the app is served at /Sobok/ based on previous context.
    const urlToOpen = new URL('/Sobok/orders', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (windowClients) {
            // Check if there is already a window/tab open with the target URL
            // We match broadly (if any page of the app is open, we can just focus it and navigate, 
            // but for simplicity, let's look for the app context)
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // If the client is already open and valid, focus it
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    return client.focus().then(client => {
                        // Optional: Navigate the focused client to the specific page
                        if (client.navigate) {
                            return client.navigate(urlToOpen);
                        }
                    });
                }
            }
            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
