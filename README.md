# TraceDiff

TraceDiff: Debugging Unexpected Code Behavior Using Trace Divergences

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)



## Installation

```shell
npm install
npm start
```

Open [http://localhost:8080/](http://localhost:8080/)




## Abstract

Recent advances in program synthesis offer means to automatically debug student submissions and generate personalized feedback in massive programming classrooms. When automatically generating feedback for programming assignments, a key challenge is designing pedagogically-useful hints that are as effective as the manual feedback given by teachers. Through an analysis of teachers' hint-giving practices in 132 online Q&A posts, we establish three design guidelines that an effective feedback design should follow. Based on these guidelines, we develop a feedback system that leverages both program synthesis and visualization techniques. Our system compares the dynamic code execution of both incorrect and fixed code and highlights how the error leads to a difference in behavior and where the incorrect code trace diverges from the expected solution. Results from our study suggest that our system enables students to detect and fix bugs that are not caught by students using another existing visual debugging tool.



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