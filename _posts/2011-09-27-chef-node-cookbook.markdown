---
layout: post
title: Nodejs chef cookbook update
categories: [chef, nodejs, git]
---

I'm not a chef or nodejs expert.  I'm sure there are better ways to do this, so don't be afraid to post a comment.

[Digitalbutter](http://www.butter.com.hk/) has a nodejs chef [cookbook](https://github.com/digitalbutter/cookbook-node) that installs nodejs.  Since nodejs is so new, you need to build it from source on most distros to get the most recent version.  It also supports installing npm dependencies and configuring a nodejs service using upstart.  All fairly useful functionality as devops goes.

Since starting a new project and integrating vagrant into it, I noticed a limitation with the cookbook: it builds nodejs from a github clone every time it runs.  If you're running this periodically on a powerful server, it's probably not that big of a deal.  It is a big deal if you're running it in a virtual machine every time you want to do some quick development.  Every time I ran `vagrant up`, I had to wait 5 to 10 minutes for nodejs to build.  This just wouldn't do.

I had two problems that needed solving: how do I know what version of nodejs is currently installed and how do I stop the process as quickly as possible?  The former was easy; the latter a little more difficult.

At the end of a successful build, I saved the output of `git show -s --format=%H` to `/usr/local/share/node\_version`.  Now I always knew the hash of the last successful build.

Initially, I compared the working directory hash with the previously built hash and didn't build if they matched.  This shaved 3-8 minutes off the entire chef-solo run.  Most of the time spent on this recipe was then being spent during the actual clone.  It seemed that /tmp was cleared when vagrant restarted, so the clone itself didn't exist anymore and needed to be re-downloaded.

How can we see what hash a particular ref points at without doing a full clone?  Back to the git manpages we go.  `git ls-remote` can connect to any remote repository and give us the hashes and names of every remote ref, including ones you might not want to see (remember that a "ref" is anything inside the .git/refs directory; notes are stored in refs/notes, for example).  Luckily there exist `-t` and `-h` options to only show tags and heads.  This workes great for any head, because the head ref pointed directly at the commit.  This didn't work so well in the case of tags.  Tags can be objects too, which have different hashes than the commits they point at.

Back to the git manpages.  This time I looked at `git-rev-parse` and found that `ref^{}` means dereference a tag to the commit it points at.  This works with `git ls-remote` so with an extra call we are able to check the ref itself and the tag reference without even cloning the repo.

The commit that implements this is uploaded to my [fork](https://github.com/xentac/cookbook-node/commit/fcb9843ceaab9bba0749a35ecba12e68a3895edc).
