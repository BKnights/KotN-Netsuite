KotN-Netsuite
=============

Various scripts I release to the Netsuite developer community.
The *.ts are TypeScript files. I find Typescript quite helpful in dealing with the Netsuite API. 
Not great to use if you have a number of developers in your account. All the *.d.ts files are the type definitions used by typescript to import type signatures for external APIs.

- AJAXFunctions.js is a sort of legacy thing I wrote back before Netsuite updated their JavaScript engine to include the new array functions. The useful thing about it now is KOTNUtil.sendJSResponse that is useful for dealing with SuiteScript responses as JSON and automatically dealing with some common jsonp callback patterns
- simpleBatch.js handles governance management for long running Scheduled Scripts
- batchProcess.js handles governance for re-scheduling a scheduled script. Most use cases now superseded by SimpleBatch.js


