import { userIsConnected } from "./users.js";
import { updateProfile } from "./users.js";

// document.addEventListener('DOMContentLoaded', () => {
    const routes = {
        404: {
            template: "/templates/404.html",
            title: "404",
        },
        "/": {
            template: "/templates/index.html",
            title: "Pong",
        },
        "/signin/": {
            template: "/templates/signin.html",
            title: "Signin",
        },
        "/signup/": {
            template: "/templates/signup.html",
            title: "Signup",
        },
        "/users/": {
            template: "/templates/users.html",
            title: "Users",
        },
        "/online/": {
            template: "/templates/online.html",
            title: "Online",
        },
        "/tournament/": {
            template: "/templates/tournament.html",
            title: "Tournament",
        },
        "/profile/": {
            template: "/templates/profile.html",
            title: "Profile",
        },
    }

    document.addEventListener("click", (e) => {
        const { target } = e;
        if (!target.matches("#profile_tab a, #user-name a, #online-mode a, #signup-switch a, #signin-switch a, #tabs-list a, #tourney-mode a, #b-signin-ok")) {
            return;
        }
        e.preventDefault();
        route(e);
    });

    export const route = (url) => {
        console.log("route: ", url);
        if (typeof url !== 'string') {
            let event = url || window.event; // get window.event if event argument not provided
            event.preventDefault();
            url = event.target.href;
        }
        // window.history.pushState(state, unused, target link);
        window.history.pushState({}, "", url);
        locationHandler();
    };

    const locationHandler = async () => {
        let location = window.location.pathname; // get the url path
        // if the path length is 0, set it to primary page route
        if (location.length == 0) {
            location = "/";
        }
        if (location == "/profile/")
        {
            if (!userIsConnected)
                location = "/signin/";
        }
        if (location == "/signin/") {
            if (userIsConnected)
                location = "/profile/";
        }
        // get the route object from the urlRoutes object
        const route = routes[location] || routes["404"];
        // get the html from the template
        console.log("PUT HTML WITH THIS LOCATION before: ", location);
        if (location == "/profile/") {
            await fetch(route.template)
            .then((response) => {return response.text();})
            .then((data) => {
                document.getElementById("content").innerHTML = data;
                let storedUser = localStorage.getItem("user");
                if (storedUser)
                {
                    let user = JSON.parse(storedUser);
                    updateProfile(user);
                }
            })
        }
        else {
            const html = await fetch(route.template).then((response) => response.text());
            document.getElementById("content").innerHTML = html;
        }
        console.log("PUT HTML WITH THIS LOCATION after: ", location);
        if (location == "/online/") {
            const scriptContent = `
                document.getElementById("online-box").style.display = "block";
                document.getElementById("online-box").classList.add("shown");
            `;
            const scriptElement = document.createElement('script');
            scriptElement.text = scriptContent;
            document.body.appendChild(scriptElement);
        }
        if (location == "/tournament/") {
            const scriptContent = `
                document.getElementById("tourney_settings-box").style.display = "block";
                document.getElementById("tourney_settings-box").classList.add("shown");
            `;
            const scriptElement = document.createElement('script');
            scriptElement.text = scriptContent;
            document.body.appendChild(scriptElement);
        }
        if (location == "/users/") {
            let usrsLst = document.getElementById("users-full-list-button");
            usrsLst.click();
        }
        // set the title of the document to the title of the route
        document.title = route.title;
        // set the description of the document to the description of the route
        // document
        //     .querySelector('meta[name="description"]')
        //     .setAttribute("content", route.description);
        // Ajoutez cette section pour mettre à jour les infos utilisateur après le chargement du HTML
        // if (location == "/profile/") {
        //     const user = JSON.parse(localStorage.getItem('user')) || {};
        //     updateProfile(user);
        // }
    };

    // add an event listener to the window that watches for url changes
    window.onpopstate = locationHandler;
    // call the urlLocationHandler function to handle the initial url
    window.route = route;
    // call the urlLocationHandler function to handle the initial url
    locationHandler();
// });
