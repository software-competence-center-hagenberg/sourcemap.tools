#!/usr/bin/env node

import fs from 'node:fs';

import { program } from "commander";
import { promisify } from 'util';

import { StackTrace } from "./js/StackTrace.js";
import { SourceMap } from './js/SourceMap.js';
import { transform } from './js/lib.js';


const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

program
  .version("1.0.0")
  .description("My Node CLI")
  .option("-f, --file <path to file>", "File with the source stack trace")
  .option("-m, --maps <paths to file separated by :>", "Source map files for the contained files")
  .option("-o, --out <path to file>", "File for the resulting mapped stack trace")
  .action(async (options) => {

	const rawStackTrace = await readFile(options.file, 'utf8');
	const stackTrace = StackTrace.create(rawStackTrace);
	console.log(`File names in the stack trace: ${stackTrace.fileNames}!`);	
  
	const maps = options.maps.split(':');
	const sourceMaps = [];
	for (const mapsFile of maps) {
		var mapsFileContent = await readFile(mapsFile, 'utf8');
		const sourceMap = await SourceMap.create(mapsFileContent, mapsFile)	
		sourceMaps.push(sourceMap);
	}
		
	const transformedStackTrace = transform(sourceMaps, stackTrace)
	if (!transformedStackTrace) {
		console.log("Looks like the stack trace could not be transformed, please make sure you included all source map files.")
	}
	await writeFile(options.out, transformedStackTrace);
  });

program.parse(process.argv);