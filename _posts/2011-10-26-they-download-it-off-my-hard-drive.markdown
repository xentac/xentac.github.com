---
layout: post
title: "\"They download it off my hard drive?\" and other misconceptions about internet security"
categories: [security]
---

"They download it off my hard drive?" was the question I received after explaining the basics of how BitTorrent works to a layperson.

For those of you who don't know know, BitTorrent is a protocol that lets many people share large files over the internet quickly.  It was unique when it came out because everyone who wanted to download a "torrent" also had to upload it to other people.  Instead of having one person send all the data to everyone who requests it, a torrent is broken up into chunks and you can download a chunk from anyone who has it, just as someone else can download a chunk you have from you.

This person's concern was that if someone can access the torrent chunks on their hard drive, what's stopping them from accessing any files?  The short (and alarmist) answer is nothing, but it's much more nuanced than that.  It also belies a misconception about how computers, data, and applications interact.

There are programs that let remote people download any file from your computer; they're called malware.  Malware is a program that run on your computer and give access to remote users.  Depending on what the program is written to do it may upload files to remote locations, delete files, install other programs, log all the keys you type, or a host of many other things.

The main difference between malware and regular, safe programs is intention.  What is the intent of the software?  Any software on your computer could upload your files, you just trust that most don't.  That new word processor you installed, the driver for your video card, every little game you download, or something sent to your email could contain malicious code that intends to do bad things to your computer.  That's why we have to be careful when opening attachments that end up in our inboxes.

Just because a particular program's primary intention is to download from and upload to other people on the internet doesn't make it inherently more or less safe; once you run it on your computer it can do just about anything.  Instead you have to ask if you trust a particular program to do what you think it does.  In the case of a popular BitTorrent client, you're probably pretty safe.
