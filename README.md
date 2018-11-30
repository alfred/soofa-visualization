**Note: I did all of this in literally 8 hours (start to finish) in Fall of 2016. Trust me, I'm much better now**

# soofa-visualization
Frontend Code Challenge from Soofa. The challenge was to combine data from the [Active Food Establishment Licenses API](http://dev.socrata.com/foundry/#/data.cityofboston.gov/fdxy-gydq) and the [Liquor Licenses API](http://dev.socrata.com/foundry/#/data.cityofboston.gov/g9d9-7sj6) to allow a user to see how the licenses of these establishments have changed over time. This accomplishes this because you can view for specifically food or liquor, or both licenses, and you can choose any date to see if the establishment had an active license at the time.

### Setup
1. Choose a webserver, just use [apache](https://www.digitalocean.com/community/tutorials/how-to-configure-the-apache-web-server-on-an-ubuntu-or-debian-vps) it's easiest to setup
2. Start your webserver `sudo apachectl start`
3. Clone this repo into your home folder
4. Remove the `index.html` file in your `/var/www/html` directory
5. Create a symlink to the cloned repo and the `/var/www/html` so that that folder's contents are the repo contents
6. Navigate to the page where your webserver is serving to, if the box you're using is your local go to localhost

### Things I'd Do Differently
* jQuery is slow as hell, but its fast as hell at scaffolding something this small
* If the data set was larger, I'd use pagination because the API supports it
* Some fields in the dataset are missing, a lot of them I don't handle (missing names)
* Should've used a date library for comparing dates, so much wasted time and brainpower
* Add more filters?
* Not have it re-draw everything after the filters are updated
  * Best case, I only draw things that aren't on the screen that I need to
  * Now that I write that, I could probably do it here if I had more time to do this, eh
* To combine a Food License and Liquor License, for places with both, I'd get the data sorted by name from the API because it supports that too, that way I could try to binary search for the matches instead of running n^2 to pair
* Probably write a more detailed setup
* Host it on my personal site instead of having to put it on EC2
* Make it mobile-ready, the requirements didn't say that so I didn't want to take more time on the layout
