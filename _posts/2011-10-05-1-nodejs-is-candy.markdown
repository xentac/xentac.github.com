---
layout: post
title: Node.js is Candy
categories: [nodejs, rant]
---

This is a response to [Node.js is Cancer](http://teddziuba.com/2011/10/node-js-is-cancer.html).  While I may agree with certain points, I take issue with the tone and a number of the implications and inferences.

The article starts off talking about how all function calls that do CPU work also block.  This is true.  Just as the LinkedIn developers found that ["\[they\] have a recommendation engine that does a ton of data crunching; Node isn’t going to be the best for that"](http://venturebeat.com/2011/08/16/linkedin-node/), so too will you find that Node.js isn't the hottest for pure CPU bound load.

How often do you do lots of data crunching in your product?  More often it's a load of db queries, possibly some calls to remote APIs, maybe even disk access.  In all of these cases, an event loop-based service won't be waiting around for responses before moving on to other work.

The author says he's "God Damned terrified of any "fast systems" that "less-than-expert programmers" bring into this world" (referring to a quote from the Node.js homepage).  Generally I prefer to test/monitor any system written by any programmer, instead of just assuming that expert or less-than-expert programmers can implement systems of any speed.  It helps to improve all experiences, user and programmer alike.

After the straightforward critique of Node.js for data processing, the article goes over the deep end.

> A long time ago, the original neckbeards decided that it was a good idea to chain together small programs that each performed a specific task, and that the universal interface between them should be text.

This statement, while true, ignores the change in perspective between then and now.  As long as your process is serial and the input and output is well defined, text pipes are generally ok.  Once you start having more complex data or want to run multiple processes at once, serialized text interfaces become more difficult to work with.

> If you develop on a Unix platform and you abide by this principle, the operating system will reward you with simplicity and prosperity. As an example, when web applications first began, the __web application__ was just a program that printed text to standard output. The web server was responsible for taking incoming requests, executing this program, and returning the result to the requester. We called this CGI, and it was a good way to do business until the micro-optimizers sank their grubby meathooks into it.

I'm not sure but I think he just said that any web application that doesn't use a CGI interface is sunken full of grubby micro-optimizer meathooks.  This pretty much defines all web applications written in the past 6 years, after PHP fell out of popularity.  One of the reasons CGI has fallen out of favour is because of long startup times while binaries load and libraries are linked/imported.  The reason we run mod\_php, FastCGI, SCGI, or HTTP servers is so we don't have the pay the process startup cost for every request.

I do find it interesting that he used CGI as The Right Way to do web applications the Unix way.  CGI depends on environment variables more than text pipes to send data between web server and web application.

> Conceptually, this is how any web application architecture that's not cancer still works today: you have a web server program that's job is to accept incoming requests, parse them, and figure out the appropriate action to take. That can be either serving a static file, running a CGI script, proxying the connection somewhere else, whatever. The point is that the HTTP server isn't the same entity doing the application work. Developers who have been around the block call this __separation of responsibility__, and it exists for a reason: loosely coupled architectures are very easy to maintain.

Just as in the last paragraph, now all web application architectures are cancers.  I don't know how this guy develops, but I know that Django has code to handle static files even though it's not meant to be used in production.

I totally agree that loosely coupled architectures are very easy to maintain.  What's stopping you from writing loosely coupled Node.js services?  How is that any different than any other application architecture?  It's just another tool in the toolbox.

> And yet, Node seems oblivious to this. Node has (and don't laugh, I am not making this shit up) its own HTTP server, __and that's what you're supposed use to serve production traffic__. Yeah, that example above when I called http.createServer(), that's the preferred setup.

This part is true.  I think the fact that the bundled HTTP server is the preferred setup is mostly an indication of the immaturity of the project, not an indictment of the effort going into it.  Your Node.js application does not need to run an HTTP server.  I'd argue that a Node.js application should be written such that it can have multiple interfaces: HTTP, message queue, pipes (wait-a-minute...).  This is an example of a _loosely coupled architecture_.  I feel like this has been mentioned before.  Oh yeah, it has because it's _very easy to maintain_.

Many other web frameworks (Rails, Django, Pyramid/Pylons/Turbogears) include their own HTTP servers.  I don't understand how this is somehow something that makes node different and worthy of ridicule.

> If you search around for "node.js deployment", you find a bunch of people putting Nginx in front of Node, and some people use a thing called Fugue, which is another JavaScript HTTP server that forks a bunch of processes to handle incoming requests, as if somebody maybe thought that this "nonblocking" snake oil might have an issue with CPU-bound performance.

Fugue isn't actually another JavaScript HTTP server.  It's just a library that uses the http module to accept requests and send them to child processes (usually one per cpu).  In fact, there is only one HTTP server in that whole bunch: the main process.  All the child processes just accept requests that were originally captured by the main fugue process.  Because they both implement the same API, your application doesn't have to be written to support fugue.

Since Node.js uses an event loop, it's single threaded by default.  Fugue is an easy way to take a single threaded application that works great and spread it across multiple cores.  Sounds like a great _separation of responsibility_ to me: don't make your application worry about multiple processors itself, let another library worry about it.

> If you're using Node, there's a 99% probability that you are both the developer and the system administrator, because any system administrator would have talked you out of using Node in the first place. So you, the developer, must face the punishment of setting up this HTTP proxying orgy if you want to put a real web server in front of Node for things like serving statics, query rewriting, rate limiting, load balancing, SSL, or any of the other futuristic things that modern HTTP servers can do. That, and it's another layer of health checks that your system will need.

Aren't developers who are also system administrators called devops?  Don't they exist in places like [Flickr](http://www.slideshare.net/jallspaw/10-deploys-per-day-dev-and-ops-cooperation-at-flickr), [Etsy](http://www.slideshare.net/jallspaw/dev-and-ops-collaboration-and-awareness-at-etsy-and-flickr), and Amazon?  I'm not sure that system administrators would try to convince you not to use Node, unless they're the same ones that think CGI is a viable deployment architecture.

I'm also not sure what adds "another layer of health checks".  Does he mean nginx or node?  Any layer you add to your application needs to be health checked.  Including CGI.

The author also complains that "It's Fucking _JavaScript_".  If you hate JavaScript that much, then don't use node.js.  If you like the idea of event loops and node.js but don't like the code example he offers, perhaps you should look at [CoffeeScript](http://jashkenas.github.com/coffee-script/) or [Closure](http://code.google.com/closure/compiler/).

His eventual conclusion is that node.js is unpleasant software and he won't use it.  That's fine with me.  My problem is that I don't understand what he does use.  He's really not very clear about what is better than node, except that it follows the _Unix Way_ and is most probably CGI.  I'm curious how he addresses slow process startup times, parallel workloads, multiple cores, and communication between loosely coupled services within a larger product architecture.  Maybe he just writes perl, ignores process metrics, runs a process for each request, and implements entire _web applications_ as a series of modules.  That's all I can conclude from this article.
