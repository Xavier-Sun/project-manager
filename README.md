# project-manager

A project management tool. It can manage almost all your projects in one stop.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)

## Background

For a developer who has mastered multiple technologies, you may store many different types of projects locally, such as:

- Some game projects made with Unity
- Some node packages
- Some C++ projects built with CMake
- Several simple scripts written in Python
- ...

Each project may have different attributes. This means that it is difficult for you to manage projects through folders.

The applications used to open each type of project are also different, so you may need to use a variety of different project managers to open your projects.

This tool attempts to solve these problems. It provides a unified interface to manage all your projects, and each project contains several labels. You can customize some commands for each label to perform some operations on the projects that contain this label.

## Install

This project uses [node](http://nodejs.org) and [yarn](https://yarnpkg.com). Go check them out if you don't have them locally installed.

```
yarn install
```

## Usage

To compile and hot-reload for development:

```
yarn electron:serve
```

To compile and minify for production:

```
yarn electron:build
```
