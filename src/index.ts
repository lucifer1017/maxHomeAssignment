
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

const getNewPotentialRobotPosition=(currentRobotPosition:RobotPosition):RobotPosition=>{
    let {x,y,heading}=currentRobotPosition;

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

const processInstruction=(currentRobotState:RobotPosition,instruction:Instruction,boundary:PlateauBoundaryCordinates):RobotPosition=>{
    if(instruction==='L'||instruction==='R'){
        const newRobotHeading=getNewRobotHeading(currentRobotState.heading,instruction);
        return {...currentRobotState,heading:newRobotHeading};
    }
    else{
        const potentialNextState=getNewPotentialRobotPosition(currentRobotState);

        if(
            potentialNextState.x>=0 &&
            potentialNextState.y>=0 &&
            potentialNextState.x<=boundary.maxX &&
            potentialNextState.y<=boundary.maxY
        )
        {
            return potentialNextState;
        }
        else{
            return currentRobotState; // basically we do not allow robot to fall of the subsurface;

        }
    }

}

const executeInstructions=(initialRobotState:RobotPosition,instructions:string,boundary:PlateauBoundaryCordinates):RobotPosition=>{
    let currentRobotState={...initialRobotState};

    for(const currentInstruction of instructions){
        if(currentInstruction==='L'||currentInstruction==='R'||currentInstruction==='M'){
            const instruction=currentInstruction;
            currentRobotState=processInstruction(currentRobotState,instruction,boundary);
        }
        else{
            continue;
        }
    }
    return currentRobotState;
}






