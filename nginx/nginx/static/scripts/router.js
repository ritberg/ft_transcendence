import { userIsConnected } from "./users.js";
import { displayProfile } from "./users.js";
import { usersClick } from "./users.js";

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
        "/tourney/": {
            template: "/templates/tournament.html",
            title: "Tournament",
        },
        "/profile/": {
            template: "/templates/profile.html",
            title: "Profile",
        },
        "/pvp/": {
            template: "/templates/pvp.html",
            title: "PVP",
        },
    }

    document.addEventListener("click", (e) => {
        const { target } = e;
        if (!target.matches("#profile_tab a, #user-name a, #online-mode a, #signup-switch a, #signin-switch a, #tabs-list a, #tourney-mode a")) {
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
        // get the route object from the urlRoutes object
        const route = routes[location] || routes["404"];
        // get the html from the template
        console.log("LOCATION: ", location);
        if (location == "/profile/") {
            await fetch(route.template)
            .then((response) => {return response.text();})
            .then((data) => {
                document.getElementById("content").innerHTML = data;
                displayProfile();
            })
        }
        else {
            const html = await fetch(route.template).then((response) => response.text());
            document.getElementById("content").innerHTML = html;
        }
        // const html = await fetch(route.template).then((response) => response.text());
        // document.getElementById("content").innerHTML = html;
        if (location == "/online/") {
            const scriptContent = `
                document.getElementById("online-box").style.display = "block";
                document.getElementById("online-box").classList.add("shown");
            `;
            const scriptElement = document.createElement('script');
            scriptElement.text = scriptContent;
            document.getElementById("content").appendChild(scriptElement);        }
        if (location == "/tourney/") {
            const scriptContent = `
                document.getElementById("tourney_settings-box").style.display = "block";
                document.getElementById("tourney_settings-box").classList.add("shown");
            `;
            const scriptElement = document.createElement('script');
            scriptElement.text = scriptContent;
            document.getElementById("content").appendChild(scriptElement);
        }
        if (location == "/users/") {
            usersClick();
        }
        // if (location == "/pvp/") {
        //     const scriptElement = document.createElement('script');
        //     scriptElement.setAttribute("src", "/static/scripts/pong_pvp.js");
        //     document.getElementById("content").appendChild(scriptElement);
        // }
        // set the title of the document to the title of the route
        document.title = route.title;
    };

    // add an event listener to the window that watches for url changes
    window.onpopstate = locationHandler;
    // call the urlLocationHandler function to handle the initial url
    window.route = route;
    // call the urlLocationHandler function to handle the initial url
    locationHandler();
// });
