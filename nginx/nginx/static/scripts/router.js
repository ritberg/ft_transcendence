const routes = {
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
    "/cpu/": {                          ///// single page /////
        template: "/templates/bot.html",
        title: "Bot",
    },
}

document.addEventListener("click", (e) => {     ///// single page /////
    const { target } = e;
    if (!target.matches("#profile_tab a, #user-name a, #online-mode a, #signup-switch a, #signin-switch a, #tabs-list a, #cpu-mode a")) {
        return;
    }
    e.preventDefault();
    route();
});

const route = (event) => {
    event = event || window.event; // get window.event if event argument not provided
    event.preventDefault();
    // window.history.pushState(state, unused, target link);
    window.history.pushState({}, "", event.target.href);
    locationHandler();
};

let previousPath = null;        ///// single page /////

const locationHandler = async () => {       ///// single page /////
    const location = window.location.pathname; // get the url path
    if (previousPath == "/cpu/" && location !== "/cpu/") {
        window.stopGame(); // Call the globally accessible stopGame function
    }
    previousPath = location;

    // removeScript();
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

    if (location == "/cpu/") {
        const scriptElement = document.createElement('script');
        scriptElement.setAttribute("src", "/static/bot/pong_bot.js");
        document.getElementById("content").appendChild(scriptElement);
    }

    
    // function removeScript() {
    //     const scriptElement = document.getElementById('dynamicScript');
    //     if (scriptElement) {
    //         scriptElement.remove();
    //     }
    // }


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