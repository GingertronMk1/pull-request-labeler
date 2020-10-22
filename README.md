# Pull Request Auto-Labeler

This is a fun little action that will automatically label your pull requests depending upon the base and head branches.
To set it up, place in your `.github` folder somewhere a yaml file with the following format:

```
head:
    - label1:
        - headbranch1
        - headbranch2
    - label2:
        - headbranch2
        - headbranch3

base:
    - label2:
        - basebranch1
        - basebranch2
    - label3:
        - basebranch2
        - basebranch3

files:
    - .github/**/*
        - dotgithub
```

In the above case this action will apply:
- label1 to any pull request:
    - from headbranch1 or headbranch2
- label2 to any pull request:
    - from headbranch2 or headbranch3 OR
    - to basebranch1 or basebranch2
- label3 to any pull request:
    - to basebranch2 or basebranch3
- dotgithub to any pull request:
    - in which a file in the `.github` folder or its subdirectories is changed
    
---

For those like me who can't remember what head/base means:
- head: the branch with the new changes you want to merge in
- base: the branch into which those changes are being merged
