const Twitter = require("twitter");

module.exports = class AltAlertBot {
  constructor(screenName, consumerKey, consumerSecret, accessTokenKey, accessTokenSecret, infoUrl) {

    // Set up the Twitter client
    this.client = new Twitter({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token_key: accessTokenKey,
      access_token_secret: accessTokenSecret
    });

    this.infoUrl = infoUrl;
    this.screenName = screenName;

    // We're going to use lastTimelineTweetId to ensure we're only looking at new tweets each time.
    this.lastTimelineTweetId = null;
    // Start off by setting it to the last tweet from this bot account
    this.getLastBotTweetId(screenName);

    // Check new tweets every 65 seconds.
    // The statuses/home_timeline API endpoint we call has a rate limit of 15 calls per 15 minute window
    // so we call it slightly less often than that just to be safe.
    setInterval(async () => {
      this.getTweets();
    }, 65*1000);    
  }

  getLastBotTweetId(screenName) {
    const params = { screen_name: screenName };

    this.client.get('statuses/user_timeline', params, (error, tweets, response) => {
      if (!error && tweets.length > 0) {
        this.lastTimelineTweetId = tweets[0].id_str;
        this.log(`Setting last tweet ID to ${tweets[0].id_str} on startup`);
        this.getTweets();
      } else if(tweets.length === 0) {
        this.lastTimelineTweetId = "1";
        this.getTweets();
      }
      else {
        this.log('Failed to startup, could not get last bot tweet id')
        this.log(JSON.stringify(error))
      }
    });
  }

  getTweets() {
    const params = {
      tweet_mode: 'extended',
      trim_user: 'false',
      include_entities: 'false',
      exclude_replies: 'false',
      include_rts: 'false',
      include_ext_alt_text: 'true',
      count: 200,
      since_id: this.lastTimelineTweetId
    };

    // Get tweets from the bot's home timeline (ie all accounts that the bot follows)
    this.client.get('statuses/home_timeline', params, (error, tweets, response) => {
      this.log(`Getting tweets since ${this.lastTimelineTweetId}`)

      if (!error) {
        this.log(`Got ${tweets.length} tweets to analyse`)
        if(tweets.length > 0) {
          this.lastTimelineTweetId = tweets[0].id_str;
        }
        tweets.forEach((t) => this.analyseTweet(t));
      } else {
        this.log('---------ERROR----------');
        this.log(error);
      }
    });
  }

  analyseTweet(tweet) {
    if(tweet.hasOwnProperty('extended_entities')) {
      const imagesWithoutAlt = tweet.extended_entities.media.filter(m => ['photo','animated_gif'].includes(m.type) && m.ext_alt_text === null);
      if(imagesWithoutAlt.length > 0) {
        this.log('Found tweet with no alt')
        this.retweet(tweet, imagesWithoutAlt.length);
      }
    }
  }

  retweet(originalTweet, badTweetCount) {
    this.log(`Retweeting ${originalTweet.user.name}`)

    const params = {
      status: `This tweet from ${originalTweet.user.name} contains ${badTweetCount === 1 ? "an image" : `${badTweetCount} images`} without alt text.\n\nAlt text is important for blind, partially sighted and neurodivergent people who use screen readers.\n\nMore info: ${this.infoUrl}`,
      attachment_url: `https://twitter.com/${originalTweet.user.screen_name}/status/${originalTweet.id_str}`
    }

    try {
      this.client.post('statuses/update', params)
    } catch(err) {
      this.log('---------ERROR----------');
      this.log(err);
    }
  }
  
  log(msg) {
    const time = (new Date).toLocaleString();
    console.log(`[@${this.screenName}] [${time}] ${msg}`);
  }

}