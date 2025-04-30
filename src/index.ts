
type Heading='N' | 'E' | 'S' | 'W' ;
type Instruction= 'L' | 'R' | 'M';

interface RobotPosition{
    x:number,
    y:number,
    heading:Heading
}
interface PlateauBoundaryCordinates{
    maxX:number,
    maxY:number
}
const headings:Heading[]=['N','E','S','W']; // So, this order actually takes care of clockwise and counter-clockwise rotation;

const getNewRobotHeading=(currentHeading:Heading,rotation:'L'|'R'):Heading=>{
    let newIndex;
    const currentIndex=headings.indexOf(currentHeading);

    if(rotation==='L'){
        newIndex= (currentIndex-1 + 4) % 4 ; //basically 4 is headings.length
    }
    else{
        newIndex= (currentIndex + 1) % 4 ; 
    }
    return headings[newIndex];
}

const getNewPotentialRobotPosition=(currentPosition:RobotPosition):RobotPosition=>{
    let {x,y,heading}=currentPosition;

    switch(heading){
        case "N":
            y++;
            break;
        case "E":
            x++;
            break;
        case "S":
            y--;
            break;
        case "W":
            x--;
            break;
    }
    return {x,y,heading};
}



