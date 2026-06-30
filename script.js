// HERO TYPING EFFECT


const heroText = 
"Web Developer | AI/ML Enthusiast | Data Science";


let i = 0;


function heroTyping(){


    if(i < heroText.length){


        document.querySelector(".role").innerHTML += heroText.charAt(i);


        i++;


        setTimeout(heroTyping,100);


    }


}



heroTyping();






// ABOUT TYPING EFFECT


const aboutText = 
"Developer | AI Learner | Problem Solver";


let j = 0;



function aboutTyping(){


    if(j < aboutText.length){


        document.querySelector(".about-type").innerHTML += aboutText.charAt(j);


        j++;


        setTimeout(aboutTyping,100);


    }


}




setTimeout(aboutTyping,2000);