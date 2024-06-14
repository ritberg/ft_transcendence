import { GameMode } from './main.js';

/////////// NAVIGATION //////////////
// const contentContainer = document.getElementById("content");
// contentContainer.addEventListener("click", function (event) {
//     if (event.target && event.target.id === "b-signin-ok") {		//// clicking on a dynamically added button
//         loginButton(event);
//     }
//     else if (event.target && event.target.id === "b-signup-ok") {
//         signupButton(event);
//     }
//     else if (event.target && event.target.id === "pvp-mode") {
//         document.getElementById("main-menu").classList.add("hidden");
//         GameMode(0);
//     }
//     else if (event.target && event.target.id === "cpu-mode") {
//         document.getElementById("main-menu").classList.add("hidden");
//         GameMode(1);
//     }
//     else if (event.target && event.target.id === "tourney-mode") {
//         document.getElementById("tourney_settings-box").style.display = "block";
//         document.getElementById("tourney_settings-box").classList.add("shown");
//         document.getElementById("b-tourney_settings").addEventListener("click", async function() {
//             document.getElementById("tourney_settings-box").style.opacity = "1";
//             document.getElementById("tourney_settings-box").classList.remove("shown");
//             document.getElementById("tourney_settings-box").classList.add("hidden");
//             document.getElementById("nickname_setup-box").style.display = "flex";
//             document.getElementById("nickname_setup-box").classList.add("shown");
//             enterNicknames(document.getElementById("s-players").value);
//             await sleep(500);
//             document.getElementById("tourney_settings-box").style.display = "none";
//             document.getElementById("tourney_settings-box").style.opacity = "0";
//             document.getElementById("tourney_settings-box").classList.remove("hidden");
//             document.getElementById("nicknames_form").addEventListener("submit", async function(event) {
//                 event.preventDefault();
//                 createPlayers();
//                 document.getElementById("nickname_setup-box").style.opacity = "1";
//                 document.getElementById("nickname_setup-box").classList.remove("shown");
//                 document.getElementById("nickname_setup-box").classList.add("hidden");
//                 await sleep(300);
//                 await drawBrackets();
//                 document.getElementById("nickname_setup-box").style.display = "none";
//                 GameMode(2);
//             });
//         });
//     }
//     else if (event.target && event.target.id === "b-online-go"){
//         // document.getElementById("main-menu").classList.add("hidden");
//         GameMode(3);
//     }
// });