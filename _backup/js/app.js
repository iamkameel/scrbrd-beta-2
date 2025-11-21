/**
 * SCRBRD Application Logic
 * Handles routing and rendering
 */

const App = {
    init: () => {
        // Check URL hash for initial route, default to dashboard
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        App.navigate(hash);

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const newHash = window.location.hash.replace('#', '') || 'dashboard';
            App.render(newHash);
        });
    },

    navigate: (route) => {
        window.location.hash = route;
        // Render is handled by hashchange listener
    },

    render: (route) => {
        const appContainer = document.getElementById('app');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');

        // Render Sidebar
        sidebar.innerHTML = Components.Navigation(route);

        // Render Main Content based on route
        switch (route) {
            case 'dashboard':
                mainContent.innerHTML = Components.Dashboard();
                break;
            case 'players':
                mainContent.innerHTML = Components.Players();
                break;
            case 'matches':
                mainContent.innerHTML = Components.Matches();
                break;
            default:
                mainContent.innerHTML = `
                    <h1>Coming Soon</h1>
                    <p>The ${route} module is under development.</p>
                `;
        }
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
