# TraceDiff

TraceDiff: Debugging Unexpected Code Behavior Using Trace Divergences [VL/HCC 2017]

[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```shell
npm install
npm start
```


## [Online Demo](https://ryosuzuki.github.io/trace-diff)

![](https://github.com/ryosuzuki/trace-diff/raw/master/resources/demo.gif)


## Abstract

Recent advances in program synthesis offer means to automatically debug student submissions and generate personalized feedback in massive programming classrooms. When automatically generating feedback for programming assignments, a key challenge is designing pedagogically-useful hints that are as effective as the manual feedback given by teachers. Through an analysis of teachers' hint-giving practices in 132 online Q&A posts, we establish three design guidelines that an effective feedback design should follow. Based on these guidelines, we develop a feedback system that leverages both program synthesis and visualization techniques. Our system compares the dynamic code execution of both incorrect and fixed code and highlights how the error leads to a difference in behavior and where the incorrect code trace diverges from the expected solution. Results from our study suggest that our system enables students to detect and fix bugs that are not caught by students using another existing visual debugging tool.

<img src="https://github.com/ryosuzuki/trace-diff/raw/master/resources/concept.png" width="500">


## Features 

### Filter
Focus attention by extracting important steps: It extracts important control flow steps by identifying a list of variables and function calls that take on different values.

<img src="https://github.com/ryosuzuki/trace-diff/raw/master/resources/filter.png" width="500">


### Highlight
Highlight behavior that diverges from the nearest solution: It compares the code execution of incorrect code with the fixed code and highlights a point when the control flow diverges.

<img src="https://github.com/ryosuzuki/trace-diff/raw/master/resources/compare.png" width="500">


### Explore
Explore behavior through interactive program visualization: Integrate Python Tutor to allow effective and interactive exploration of collected code traces.

<img src="https://github.com/ryosuzuki/trace-diff/raw/master/resources/trace.png" width="500">


### Abstraction
Map the error to the cause by abstracting expressions: It enables the student to interactively map a concrete value (e.g., `sum = 3` and `return 11`) back to the expressions that computed these values, such as variables and function calls (e.g., `sum = add(1, 2)` and `return total`) to help locate the cause of the bug.

<img src="https://github.com/ryosuzuki/trace-diff/raw/master/resources/abstract.png" width="500">



## Citation

```
@inproceedings{suzuki2017tracediff,
  title={TraceDiff: Debugging unexpected code behavior using trace divergences},
  author={Suzuki, Ryo and Soares, Gustavo and Head, Andrew and Glassman, Elena and Reis, Ruan and Mongiovi, Melina and Antoni, Loris D'and Hartman, Bj\"{o}rn},
  booktitle={Visual Languages and Human-Centric Computing (VL/HCC), 2017 IEEE Symposium on},
  year={2017},
  organization={IEEE}
}
```

## Acknowledgements

This is a joint work between the University of Colorado Boulder, UC Berkeley, Federal University of Campina Grande, and University of Wisconsin-Madison. 
This research was supported by the NSF Expeditions in Computing award CCF 1138996, NSF CAREER award IIS 1149799, CAPES 8114/15-3, an NDSEG fellowship, a Google CS Capacity Award, and the Nakajima Foundation.

