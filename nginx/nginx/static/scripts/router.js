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
    }

    document.addEventListener("click", (e) => {
        const { target } = e;
        if (!target.matches("#profile_tab a, #user-name a, #online-mode a, #signup-switch a, #signin-switch a, #tabs-list a, #tourney-mode a, #b-signin-ok")) {
            return;
        }
        e.preventDefault();
        route(e);
    });

    // const route = (url) => {
    //     // Si l'argument n'est pas un string, il s'agit probablement d'un événement
    //     if (typeof url !== 'string') {
    //         event = url || window.event; // get window.event if event argument not provided
    //         event.preventDefault();
    //         url = event.target.href;
    //     }
    //     // window.history.pushState(state, unused, target link);
    //     window.history.pushState({}, "", url);
    //     locationHandler();
    // };
    export const route = (url) => {
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
        const location = window.location.pathname; // get the url path
        // if the path length is 0, set it to primary page route
        if (location.length == 0) {
            location = "/";
        }
        // get the route object from the urlRoutes object
        const route = routes[location] || routes["404"];
        // get the html from the template
        const html = await fetch(route.template).then((response) => response.text());
        // set the content of the content div to the html
        document.getElementById("content").innerHTML = html;

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
        // set the title of the document to the title of the route
        document.title = route.title;
        // set the description of the document to the description of the route
        // document
        //     .querySelector('meta[name="description"]')
        //     .setAttribute("content", route.description);
    };

    // add an event listener to the window that watches for url changes
    window.onpopstate = locationHandler;
    // call the urlLocationHandler function to handle the initial url
    window.route = route;
    // call the urlLocationHandler function to handle the initial url
    locationHandler();
// });