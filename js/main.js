//STARSIGN onClick return-header-* function
function returnHeader(elem){
    var parentEle = document.querySelector("#"+elem).parentElement;
    parentEle.classList.toggle("starmode");

    document.querySelector('#hero-star').classList.toggle("hero-star-content");

    //Assign each child and grandchild a specific star animation
    var childrenFirstGen = Array.from(parentEle.children);
    childrenFirstGen.forEach(function(node){
        node.classList.toggle("closeFirst");
        var childrenSecondGen = Array.from(node.children);

            childrenSecondGen.forEach(function(node){
                node.classList.toggle("closeSecond");
                var childrenThirdGen = Array.from(node.children);

                    childrenThirdGen.forEach(function(node){
                        node.classList.toggle("closeThird");
                        var childrenFourthGen = Array.from(node.children);

                            childrenFourthGen.forEach(function(node){
                                node.classList.toggle("closeFourth");
                                var childrenFifthGen = Array.from(node.children);

                                    childrenFifthGen.forEach(function(node){
                                        node.classList.toggle("closeFifth");
                                        var childrenSixthGen = Array.from(node.children);

                                            childrenSixthGen.forEach(function(node){
                                                node.classList.toggle("closeSixth");
                                                var childrenSeventhGen = Array.from(node.children);

                                                    childrenSeventhGen.forEach(function(node){
                                                        node.classList.toggle("closeSeventh");
                                                        var childrenEigthGen = Array.from(node.children);

                                                            childrenEigthGen.forEach(function(node){
                                                                node.classList.toggle("closeEigth");
                                                                var childrenNinthGen = Array.from(node.children);

                                                                    childrenNinthGen.forEach(function(node){
                                                                        node.classList.toggle("closeNinth");
                                                                        var childrenTenthGen = Array.from(node.children);

                                                                            childrenTenthGen.forEach(function(node){
                                                                                node.classList.toggle("closeTenth");
                                                                            })
                                                                    })
                                                            })
                                                    })
                                            })
                                    })
                            })
                    })
            })
    })

    parentEle.querySelectorAll('*').forEach(function(node){
        node.classList.toggle("close");
    })
    
  
}

// STARSIGN ONLOAD PAGE. ##Add each "return-header-*" here
window.onload = returnHeader('return-header-novem');

// TRANSLATE RANDOMIZER VALUE
const root = document.querySelector(":root"); // we first get the root element
for(let i = 0; i < 10; i++) {
    root.style.setProperty(`--randoFirst${i}`, `${Math.floor(Math.random() * 2) + 1}px`);
}
for(let i = 0; i < 10; i++) {
    root.style.setProperty(`--randoSecond${i}`, `${Math.floor(Math.random() * 2) + 1}px`);
}
for(let i = 0; i < 10; i++) {
    root.style.setProperty(`--randoThird${i}`, `${Math.floor(Math.random() * 2) + 1}px`);
}
for(let i = 0; i < 10; i++) {
    root.style.setProperty(`--randoFourth${i}`, `${Math.floor(Math.random() * 2) + 1}px`);
}
for(let i = 0; i < 10; i++) {
    root.style.setProperty(`--randoFifth${i}`, `${Math.floor(Math.random() * 4) + 1}px`);
}
for(let i = 0; i < 10; i++) {
    root.style.setProperty(`--randoSixth${i}`, `${Math.floor(Math.random() * 2) + 1}px`);
}
for(let i = 0; i < 10; i++) {
    root.style.setProperty(`--randoSeventh${i}`, `${Math.floor(Math.random() * 2) + 1}px`);
}
for(let i = 0; i < 10; i++) {
    root.style.setProperty(`--randoEigth${i}`, `${Math.floor(Math.random() * 2) + 1}px`);
}
for(let i = 0; i < 10; i++) {
    root.style.setProperty(`--randoNinth${i}`, `${Math.floor(Math.random() * 2) + 1}px`);
}
for(let i = 0; i < 10; i++) {
    root.style.setProperty(`--randoTenth${i}`, `${Math.floor(Math.random() * 2) + 1}px`);
}
// DEGREES
for(let i = 0; i < 50; i++) {
    root.style.setProperty(`--randoDeg${i}`, `${Math.floor(Math.random() * 360) + 1}deg`);
}
// BLUR
for(let i = 0; i < 50; i++) {
    root.style.setProperty(`--randoBlur${i}`, `${Math.floor(Math.random() * 4) + 1}px`);
}

//Change speed of video
function videoSpeed(id, speed){
let vid = document.getElementById(id);
vid.playbackRate = speed;
}
//Assign which video to change speed of
window.onload = videoSpeed('starVideo', 0.3);