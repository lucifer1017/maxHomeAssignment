import * as readline from 'readline';
import * as process from 'process';


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

const validatePlateauBoundary=(boundary:PlateauBoundaryCordinates):string | null=>{
    if (boundary.maxX < 0 || boundary.maxY < 0) {
        return `Invalid plateau dimensions: maxX and maxY must be non-negative. Received: ${boundary.maxX}, ${boundary.maxY}`;
    }

    return null;
}
const validateInitialRobotState=(initialRobotState:RobotPosition,boundary:PlateauBoundaryCordinates):string | null =>{

    if(
        initialRobotState.x<0 || initialRobotState.y<0 ||
        initialRobotState.x>boundary.maxX ||
        initialRobotState.y>boundary.maxY
    ){
        return `Robot initial position (${initialRobotState.x}, ${initialRobotState.y}) is outside the plateau boundaries (0,0 to ${boundary.maxX}, ${boundary.maxY}).`;
    }
    if (!headings.includes(initialRobotState.heading)) {
       return `Robot initial heading "${initialRobotState.heading}" is invalid. Must be one of ${headings.join(', ')}.`;
   }
    return null;
}

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

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let lines: string[] = [];
    let plateauBoundary: PlateauBoundaryCordinates | null = null;
    const robotInputs: { initialState: RobotPosition, instructions: string }[] = [];

    for await (const line of rl) {
        lines.push(line.trim());
    }

    if (lines.length === 0) {
        console.error("Error: No input received.");
        process.exit(1);
    }

    const plateauLine = lines.shift();
    if (!plateauLine) {
         console.error("Error: Could not read plateau boundary line.");
         process.exit(1);
    }

    const plateauDimensions = plateauLine.split(' ');
    if (plateauDimensions.length !== 2) {
        console.error(`Error: Invalid plateau boundary format. Expected "X Y", received "${plateauLine}".`);
        process.exit(1);
    }

    const maxX = parseInt(plateauDimensions[0], 10);
    const maxY = parseInt(plateauDimensions[1], 10);

    if (isNaN(maxX) || isNaN(maxY) || !Number.isInteger(maxX) || !Number.isInteger(maxY)) {
         console.error(`Error: Invalid plateau boundary coordinates. Expected integers, received "${plateauDimensions[0]}" and "${plateauDimensions[1]}".`);
         process.exit(1);
    }

    plateauBoundary = { maxX, maxY };

    const plateauValidationError = validatePlateauBoundary(plateauBoundary);
    if (plateauValidationError) {
        console.error(`Error: ${plateauValidationError}`);
        process.exit(1);
    }

    if (lines.length % 2 !== 0) {
        console.error("Error: Invalid number of input lines for robots. Robot input requires pairs of lines (position and instructions).");
        process.exit(1);
    }

    for (let i = 0; i < lines.length; i += 2) {
        const positionLine = lines[i];
        const instructionsLine = lines[i + 1];

        const positionParts = positionLine.split(' ');
        if (positionParts.length !== 3) {
            console.error(`Error: Invalid robot position format on line ${i + 2}. Expected "Xcordinate Ycordinate Heading", received "${positionLine}". Skipping robot.`);
            continue;
        }

        const x = parseInt(positionParts[0], 10);
        const y = parseInt(positionParts[1], 10);
        const headingChar = positionParts[2];

        if (isNaN(x) || isNaN(y) || !Number.isInteger(x) || !Number.isInteger(y)) {
            console.error(`Error: Invalid robot position coordinates on line ${i + 2}. Expected integers, received "${positionParts[0]}" and "${positionParts[1]}". Skipping robot.`);
            continue;
        }

        const initialHeadingCandidate = headingChar as Heading;

        const initialState: RobotPosition = { x, y, heading: initialHeadingCandidate };
        const instructions = instructionsLine;

        robotInputs.push({ initialState, instructions });
    }

    for (const robotInput of robotInputs) {
        const initialRobotStateError = validateInitialRobotState(robotInput.initialState, plateauBoundary);

        if (initialRobotStateError) {
            console.error(`Validation Error for robot: ${initialRobotStateError}. Skipping instructions for this robot.`);
            continue;
        }

        const finalState = executeInstructions(robotInput.initialState, robotInput.instructions, plateauBoundary);

        console.log(`${finalState.x} ${finalState.y} ${finalState.heading}`);
    }

    rl.close();
}

main();




