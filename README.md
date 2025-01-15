# lernmar
Typescript library and Python tools for creating and playing SCORM courses

## content

### Typescript

- **src/api:** the types of the SCORM API which can be used for both, a player and a course (or its wrapper).
- **src/composite:** the implementation of a course which is composed of other SCORM courses. the composite course acts like a SCORM player (which instead of showing a selection of courses) and playing one on request, plays the sub-courses and communicates their results to the learn management system.
- **src/player:** a rudimentary player which provides the interface for a SCORM course to run without having an actual Learn Management System.
- **src/wrapper:** a rudimentary wrapper which a course can use to become SCORM compliant.
- **dist:** The typescript libraries are built inside sub-directories of dist. The build generates ECMAScript (.js), declaration (.d.ts) and source map (.d.ts.map) files. As the import statements inside the .js files remain without .js ending, they will not work in most js engines (cf. https://github.com/microsoft/TypeScript/issues/16577).
- **test:** This is the space for jest tests.

### Python

- **tools:** Python tools for generating SCORM courses.
