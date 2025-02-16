<!-- FIRST STEP -->

#First we install the typescript ,ts-node(for running ts directly) using command
'npm i typescript ts-node --save-dev'
--save-dev flag because it saves TypeScript as a development dependency.

<!-- SECOND STEP -->

Setup typescript configuration , create 'tsconfig.json' file

<!-- THIRD STEP -->

_open tsconfig.json_
uncomment and assign the build foder to outDir
=> "outDir" : "./build/"
=> "rootDir" : "./src/"npx tsc

<!-- FOURTH STEP -->

'node-tsc'

This command compile the TypeScript files in the src folder and output the JavaScript files into the build folder

#Run code directly wihout compiling
'npx ts-node src/index.ts'

#Run your compiled code using command
'node dist/index.js'

NOW create the all folder and files
    we can user this comand if we want to use any command before "npm run dev"
    "predev":"sudo docker start mongodb",
    "postdev":"sudo docker stop mongodb",
