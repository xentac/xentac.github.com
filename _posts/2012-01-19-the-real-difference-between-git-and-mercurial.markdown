---
layout: post
title: The Real Difference Between Git and Mercurial
categories: [git, hg]
---

I have a friend who is quite proficient with git but has recently started a job that uses mercurial for their development and he's been learning how to use it.  I used this opportunity to do some research into the history of git and mercurial and why they've turned out to be such different (yet similar) tools.  I will start off by saying that I am a fan of git but my intention is not to show that one is better than the other, only to highlight the differences between the two and why they are the way they are.  I will try to include references where I have found them.

There are a number of commonalities between git and mercurial: they are both version control systems; they both refer to their revisions with hashes; they both represent history as Directed Acyclic Graphs (DAGs); they both offer a lot of high level functionality like bisect, history rewriting, branches, and selective commits.

Both git and mercurial were developed to solve a large problem that was happening in 2005.  The Linux kernel was [no longer allowed](http://article.gmane.org/gmane.linux.kernel/293914) to use BitKeeper for free as its version control system.  Having used BitKeeper for 3 years, the kernel developers had become accustomed to their new distributed workflow.  No longer were patches emailed between people, lost, resubmitted, and managed personally by a [series of shell scripts](http://savannah.nongnu.org/projects/quilt).  Now patches/features were recorded, pulled, and merged by a fancy piece of software that made it possible to track history over long periods and hunt down regressions.

It also strengthened the [kernel development workflow](http://progit.org/book/ch5-1.html) where there was one Dictator and multiple Lieutenants, each responsible for their subsystems.  Each Lieutenant vetted and accepted patches to their subsystems and Linus pulled their changes and made the official linux repository available.  Anything that replaced BitKeeper would have to enable this workflow.

Not only did any replacement need to support a distributed workflow, it also had to be fast for a large number of changes and files.  The Linux kernel is a very large project that has thousands of changes each day contributed by thousands of people.

Lots of tools were evaluated and none quite passed muster.  Matt Mackall decided to [create mercurial](http://lkml.indiana.edu/hypermail/linux/kernel/0504.2/0670.html) to solve the problem around the same time[^sametime] that Linus decided to [create git](http://article.gmane.org/gmane.linux.kernel/294398).  Both borrowed some ideas from the [monotone](http://www.monotone.ca/) project.  I will try to identify those where I recognize them.

Both git and mercurial identify versions of files with hashes.  File hashes are combined in manifests (git calls them trees and git trees can also point to other trees).  Manifests are pointed to by revisions/commits/changelogs (commits from now on).  The key to how the various tools differ is how they represent these concepts.

Mercurial decided to solve the performance problem by developing a [specialized storage format](http://hgbook.red-bean.com/read/behind-the-scenes.html): Revlog[^revlog].  Every file is made up of an index and a data file.  Data files contain snapshots and deltas--snapshots are only created if the number of deltas to represent a file goes over a threshold.  The index is key to efficient access to the data file.  Changes to files are only ever appended to the data file. Because files aren't always changed sequentially, the index is used to group parts of the data file into coherent chunks that represent a particular file version.

From file revisions, manifests are created and from manifests, commits are created.  Creating, finding, and calculating differences to files are very efficient given this method.  It takes a relatively small amount of space on the disk to represent these changes.  The network protocol to transfer changes is similarly efficient.

Git takes the opposite approach: file blobs[^fileblobs].  To store revisions quickly, each new file revision is a complete copy of the file.  These copies are compressed, but there is a lot of duplication.  The developers of git have created methods to reduce the storage requirements by packing data--essentially creating something like a revlog at a given point in time.  These packs are not the same thing as a revlog, but serve a similar purpose of storing data in a space efficient format.

Because git stores everything in files, its history is a lot more fluid.  Object files can be copied in from anywhere using any method (e.g. `rsync`).  Commits can be created or destroyed.  Just as history isn't linear in distributed version control world, git's data model doesn't depend on linear files.  Mercurial's file format is to git as compressed files are to sparse files.

Both tools have the notion of branches, but they are different.  A mercurial branch is something that is added to a commit and sticks around forever.  Anyone who pulls from you will see all the branches that are in your repository and which commits are in each one.  There are ways to do git branches in mercurial, but we will get into that later when we talk about extensions.

[Git branches](https://lkml.org/lkml/2005/6/24/187) are just pointers to commits.  That's it.  They do nothing other than tell the git client, "when I'm in this branch, this is what my working copy looks like".  They can point to different commits, they can be deleted, they can be passed around (each one is uniquely identified by the local name of the repository it came from).  There is one convenience that the git client offers you: when you make a commit, your branch pointer is automatically updated.

Generally when people want git branches in mercurial, they create a new clone.  That's great if all you want is to create commits that represent two concurrent development streams, but if you want to start merging between them or comparing histories, you need tools that understand these two directories are related in some ways (I'm sure extensions exist to do that, but I'm getting to that).

Mercurial branches serve a different purpose than git branches.  Mercurial branches represent a shared place for development to happen outside the default branch.  Because everyone shares branch names, they are reserved for long-living versions of your project.

Given these differences, it's no wonder that git and mercurial have different interfaces.  Mercurial makes it easy to create commits, push and pull them, and generally move history forward.  Git doesn't care about history moving forward, all it cares about is creating commits and pointing at them.  It doesn't matter what the commits represented previously or what the pointers used to point at, this is what they mean now.

There do exist safeguards to make sure that git branch changes don't destroy any history that was previously pulled down into a local repository: the fast-forward merge.  While it's true that git will complain if a fetch tries to pull down commits that can't be reconciled without moving forward, these errors can be overridden if you expect the changes.

This belies one of the main differences I've found between git and mercurial.  When a git user runs into a problem, they look at the tools they have on hand and ask, "how can I combine these ideas to solve my problem?"  When a mercurial user runs into a problem, they look at the problem and ask, "what code can I write to work around this?"  They are very different approaches that may end up at the same place, but follow alternate routes.

To rollback a commit or a pull/merge, git just points the branch pointer at the old commit.  In fact, any time you want to go back to a previous state, git keeps a reflog to tell you what the commit hash was at that point.  As long as something has been committed, you can always get it back in git.

As far as I know, there are cases in mercurial where you can't get back to [where you were](http://stackoverflow.com/questions/265944/backing-out-a-backwards-merge-on-mercurial).  Because solving a problem in mercurial generally creates another commit, it can be hard in some cases to say, "put me back to the moment exactly before I screwed everything else up".

To solve problems in mercurial, you end up with a lot of extensions.  Each extension solves its particular problem well without the benefit of the underlying data model.  Combining features and functionality complicates the use of extensions.

Here is a great example of that.  In git, if you want to record your current working directory state without creating a local branch/commit, you can use a stash.  What is a stash?  It's a commit and branch that isn't stored in the standard place.  It doesn't show up when you ask for all the branches (git branch), but all of the tools can treat it like a branch.  Once you've created a few stashes (they will create a linear history in a single special branch), it's possible to do things like compare them to existing files (or refer to them based on the time they were created) using standard syntax.

If you want do the same thing in Mercurial, you can use the [attic](http://mercurial.selenic.com/wiki/AtticExtension) or [shelve](http://mercurial.selenic.com/wiki/ShelveExtension) extension (or the pbranch extension, says the attic extension page).  These both store the stashed patches as files in the repository that can be committed if necessary.  Each one solves a slightly different problem in slightly different ways instead of being able to use the underlying "plumbing"[^plumbing] to store data in a consistent manner.

Another great example is `git commit --amend`.  If you want to modify the most recent commit, to add something you forgot or just change the commit message, `git commit --amend` will create a whole new set of file objects, tree objects, and a commit object.  After it's done those things, it updates the branch pointer.  If you then decide that that wasn't really what you wanted to do, you can just point the branch pointer back at the previous commit with `git reset --hard HEAD@{1}` (or by looking through the reflog for the commit hash that the branch used to point at).

To do the same thing in Mercurial, there are a few options: you can rollback the commit and then create a new one, but all records of the original commit are gone or you could use the queue extension to import the last commit, then modify it with your current changes, then create a new commit.  Neither of these options benefits from any features that mercurial's data store offers, they exist solely to work around it.

[^sametime]: I have seen it said that mercurial was an older and more mature project than git, but Mark Mackall says that Linus had [a few days' head start](http://lkml.indiana.edu/hypermail/linux/kernel/0504.3/1404.html).
[^revlog]: Matt Mackall released a paper on [Revlog and Mercurial](http://selenic.com/mercurial/wiki/index.cgi/Presentations?action=AttachFile&do=get&target=ols-mercurial-paper.pdf) at the Ottawa Linux Symposium, 2006.
[^fileblobs]: [The Git Object Model](http://book.git-scm.com/1_the_git_object_model.html) from the Git Community Book.
[^plumbing]: Git refers to the underlying code as "plumbing" and the user interface code as "porcelain".
