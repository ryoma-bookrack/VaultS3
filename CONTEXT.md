# CONTEXT.md — 领域术语表

> 本文件是术语 glossary，**不**放实现细节、规格、草稿。新条目由
> agent-step 的 align-grill 在对齐过程中**当场**写入。

## 约定

- 术语首字母大写，不变复数（`Project` 而非 `Projects`）。
- 每条术语一段定义；冲突 / 歧义当场指出并解决。
- 当用户口语与本表冲突时，**本表优先**，直到用户显式改本表。

## 术语

### Project

一个 git 仓库根目录所代表的工作单元。所有 agent-step skill 都假设"当前工作目录落在某个 Project 内"。

### Skill

一项可触发的 Agent 能力（`SKILL.md`）。Agent 在满足触发条件时**自动**或**应用户指令**调用之；不强制按顺序串联。

### Problem

`.scratch/<problem-group>/NNN-<slug>.md` 这一份 markdown 文件。本仓开发流程中使用的工单。状态由文件首部的 `Status:` 行表达。

### Problem Group

`.scratch/<problem-group>/` 这一层目录所代表的功能 / 主题分组。一个 Problem Group 可以包含若干 Problem。

### Larder

本仓要做成的产品。  
英文名暂定 Larder，中文名储藏室。  
它是给局域网用的对象存储工具。  
易混：VaultS3 是上游项目名，不是这个产品的名字。

### VaultS3

上游开源项目，来源仓库是 https://github.com/Kodiqa-Solutions/VaultS3 。
本仓从它分出来继续改。
易混：Larder。

### Upstream

VaultS3 这一上游来源。
Git 远程名是 `upstream`。
易混：Origin。

### Origin

本仓自己的远程，指向 `git@github.com:ryoma-bookrack/VaultS3.git`。
易混：Upstream。

### Main

本仓自己的开发主分支，跟踪 Origin 的 `main`。
易混：Upstream Anchor。那条跟踪的是上游的 `main`。

### Upstream Anchor

承接上游代码的本地分支，名字是 `upstream-main`，跟踪 Upstream 的 `main`。
后续开发用它把上游代码同步进来。
产品改动不写在这条分支上。

### Upstream Doc

上游带来的说明，目录是 `upstream-docs/`。
上游原来的首页在 `README-upstream.md`。
易混：Doc。

### Doc

本仓自己的文档，目录是 `docs/`。
目前只有给代理用的约定，还没有产品说明。
易混：Upstream Doc。

### Server

跑起来的那一个 Larder 进程。
它同时提供 S3 API 和 Dashboard。
默认用法是一台机器上一个 Server。

### Bucket

一组 Object 的命名空间。
客户端先有 Bucket，再往里面放 Object。

### Object

Bucket 里的一份存储项，由 Bucket 和 Key 一起定位。
它分成 Object Data 和 Metadata。

### Key

Object 在 Bucket 里的名字。
名字里可以有斜杠，看起来像目录，但仍然是一个 Key，不是真实的文件夹。

### Object Data

Object 的字节内容，放在 Node 自己的磁盘上。
易混：Metadata。那是索引，不是这些字节。

### Metadata

Bucket 和 Object 的索引，例如有哪些对象、大小、校验和标签。
它和 Object Data 分开存放。
在 Cluster 里，各 Node 要对 Metadata 达成一致。
Object Data 仍在各 Node 自己的磁盘上。

### Version

同一个 Key 先后留下的一份内容。
打开版本后，新写入不会擦掉旧的一份。

### S3 API

客户端访问 Larder 所用的接口，兼容 Amazon S3。
易混：Dashboard。

### Dashboard

嵌在 Server 里的网页，给人管理桶、文件和用户。
易混：S3 API。

### Access Key

调用 S3 API 用的一对凭证。
易混：打开 Dashboard 用的登录身份。两者不是同一件事。

### Encryption

写到磁盘上的 Object Data 可以加密后再存。
服务器可以代管密钥，也可以由客户端每次请求自己带密钥，服务器不留下那把密钥。

### Node

一台正在运行 Server、并保管自己磁盘上 Object Data 的机器。
只有一台时，Node 就是这台 Server。

### Cluster

多台 Node 一起对外服务。
Metadata 在这些 Node 之间保持一致，Object Data 按副本放在其中若干 Node 上。
易混：Erasure Coding。那只处理一台 Node 内部的磁盘损坏。

### Erasure Coding

把一台 Node 上的 Object Data 拆开写到这台 Node 自己的多块磁盘上，以便坏一块盘还能读出来。
它不跨 Node。
易混：Replica。

### Replica

一份 Object Data 在另一台 Node 上的完整拷贝，用来扛整台 Node 丢失。
它不保护同一台 Node 里的单块磁盘。
单块磁盘要靠 Erasure Coding，或者磁盘阵列。