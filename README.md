# alt-alert-twitter-bot
A Twitter bot engine which quote-tweets tweets without alt text. 
Originally used for [@UKGovAltBot](https://twitter.com/UKGovAltBot), [@UKCouncilAltBot](https://twitter.com/UKCouncilAltBot) and [@USGovAltBot](https://twitter.com/USGovAltBot)
![Screenshot of a tweet from UK Gov Alt Bot, quote-tweeting Rishi Sunak. Tweet text: This tweet from Rishi Sunak contains an image without alt text. Alt text is important for blind, partially sighted and neurodivergent people who use screen readers. More info: link to Civil Service alt text guidance](https://user-images.githubusercontent.com/1935173/170481362-40b617a7-84af-45c0-bff3-0644d6da01cf.png)

Blind, visually impaired and neurodivergent people often use screen reader software to help them use websites and apps. 
Screen readers rely on alt text to describe images, but if people don't provide alt text those images aren't accessible to people using screen readers.

This engine powers bots which find images posted by users the bot is following. If they don't have alt text the bot quote-tweets them, pointing the tweet's author to guidance on how to use alt text.
You can power multiple bots with a single instance of the engine.

# Getting started

## Register a Twitter account for the bot
Before you do anything else, you'll need to [sign up for a Twitter account](https://twitter.com/i/flow/signup) for your bot.

## Add 'Automated by' label
Once the bot account is registered, you should add an 'Automated by' label to it.

![Screenshot of Twitter account information for UK Gov Alt Bot. There's a robot face icon with the text 'automated by @MattEason'](https://user-images.githubusercontent.com/1935173/170465974-ddf29154-007b-4541-8a00-3ac3a6d3787a.png)

To add this label:

1. Go to your account settings
2. Select "Account information"
3. Select "Your account"
4. Select "Automation" at the bottom
5. Select "Set up account automation"
6. Enter your main Twitter username which runs your bot account
7. Enter the password for your main Twitter account

## Sign up for a developer Twitter account
You need a developer account to use the APIs. I recommend you do this with your main Twitter account rather than the bot account, especially if you're
planning to run multiple bots.

Sign up from the [Twitter Developer Platform homepage](https://developer.twitter.com).

After you've signed up, you'll be asked to create a project, then an app. Go through these steps. 
The app name you choose will be shown on your tweets where you'd usually see 'Twitter for iOS' or 'Twitter for Android'

Once your app has been created, you'll be shown an API Key and an API Key Secret. Copy these now and keep them safe - you'll need them later.

You'll now have access to the v2 API. Unfortunately we need access to v1.1, because the endpoint the bot relies on 
(`statuses/home_timeline`) isn't in v2 yet.

To get access to v1.1, you'll need to apply for 'elevated access'. Select your project from the left-hand menu. You should see the following option:

![Do you need Elevated access for your Project? Apply button](https://user-images.githubusercontent.com/1935173/170470708-5d0fccd3-765e-46de-a375-21b56c566a00.png)

You'll have to fill in a bunch of boxes about your 'intended use'. Here's some suggested text for each part:

### Describe how you plan to use Twitter data and/or APIs
"I'm developing a bot which follows **[TYPE OF ACCOUNTS YOU'RE PLANNING TO FOLLOW]** to check whether the images they're 
tweeting are accessible to blind and low-vision users. This was inspired by your recent roll-out of the ALT badge so that users 
can see which images have alt text."

### Are you planning to analyze Twitter data?

Select 'Yes'

"Using the 'statuses/home_timeline' v1.1 API endpoint the bot analyses every tweet from **[TYPE OF ACCOUNTS YOU'RE PLANNING TO FOLLOW]** 
and looks for images included in the tweet. The bot determines whether the images in the tweet all have alt text by looking at the 
'ext_alt_text' property for each image. Using the v1.1 API is necessary because v2 doesn't have an equivalent to the home_timeline endpoint 
and the list endpoints don't allow you to filter out things like replies and retweets."

### Will your App use Tweet, Retweet, Like, Follow, or Direct Message functionality?

Select 'Yes'

"If an image doesn't have alt text, the bot will quote-tweet the original tweet to highlight that it doesn't have alt text. 
This uses the 'statuses/update' endpoint. This is the only interaction the bot will have."

### Do you plan to display Tweets or aggregate data about Twitter content outside Twitter?

Select 'No'

### Will your product, service, or analysis make Twitter content or derived information available to a government entity?

Select 'No'

### And now we wait
After you've submitted your application, you may need to wait a few days for it to be approved.

## Follow accounts
Your bot will only quote-tweet accounts that it's following, so go and follow those accounts while you wait for your API access to be approved.
Following is rate-limited and you can only follow 400 accounts a day, so take it steady.

## Authenticate your bot
You'll need to authorise your app to post on behalf of your bot's Twitter account. 
You'll need a REST client such as [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/)

### Step 1 - Get an OAuth token

Make a POST request to `https://api.twitter.com/oauth/request_token?x_auth_access_type=write`. You'll need to use OAuth 1 authentication. 
The Consumer Key and Consumer Key Secret are the API Key and API Key Secret you got when you were setting up your Twitter app.

![Screenshot of Insomnia REST client showing a request to the Twitter request token endpoint](https://user-images.githubusercontent.com/1935173/170474789-afd63ed0-68c3-4192-8997-8fd97ae6db66.png)

In the response, you'll get an `oauth_token` and an `oauth_token_secret`. Copy these somewhere safe.

### Step 2 - Go to the authentication URL

Make sure you're signed into Twitter with your bot account, then go to `https://api.twitter.com/oauth/authenticate?oauth_token=TOKEN`, replacing TOKEN with 
the `oauth_token` from the last step.

You'll see an authorisation screen. Click the blue 'Authorize app' button. You'll see a seven-digit PIN. Copy this somewhere safe.

### Step 3 - Get an access token and access token secret

Go back to your REST client and make a POST request to `https://api.twitter.com/oauth/access_token?oauth_verifier=PIN&oauth_token=TOKEN`,
replacing PIN with the PIN from step 2 and TOKEN with the `oauth_token` from step 1.

In the response, you'll get a different `oauth_token` and `oauth_token_secret` to step 1. 
These are the Access Token and Access Token Secret you'll need for your bot. Copy them somewhere safe.

## Configure the bot
Clone this repo then copy `config.json.sample` to `config.json`. In `config.json`, set the following values:

- `consumerKey`: The API Key from when you set up the app in the Twitter dev dashboard
- `consumerKeySecret`: The API Key Secret from when you set up the app in the Twitter dev dashboard
- `screenName`: Your bot's Twitter username, without the @
- `accessTokenKey`: The Access Token from step 3 above
- `accessTokenSecret`: The Access Token Secret from step 3 above
- `infoUrl`: This is the 'more info' link that will be included in your bot's tweets. The default is the Twitter guidance on adding alt text.
You might want to change this if there's more specific guidance for your intended audience.

If you want to run multiple bots you can add more entries to the `botAccounts` array. You'll need to follow the steps above to register a 
Twitter account and authenticate for each bot.

## Install dependencies
Install [Node.js](https://nodejs.org/en/) (I've tested with v16).

In the project directory (`alt-alert-twitter-bot`) run `npm install`

## (Optional) Customise the tweet text
If you want to change the text the bot uses when it quote-tweets, you'll need to edit the `status` param in the `retweet` function in `AltAlertBot.js`.

This is useful if, for example, you want to localise the bot to a different language. Please keep the text polite and informative, and do not
@mention the account you're retweeting. Unsolicited @mentions are forbidden in the API terms of use and your bot is likely to be shut down if you use them.

## Run the bot
In the project directory (`alt-alert-twitter-bot`) run `npm run start`

Your bot(s) should start up and begin logging to the console:

![Screenshot of text console showing logging lines from the alt bot](https://user-images.githubusercontent.com/1935173/170477356-b7337ee5-7872-4bf0-9d9d-d9f22abebf58.png)

## Running on a server
You'll probably want your bot running on a server to ensure it's always on. That's outside the scope of this README, but Googling for
'run node app on ${your cloud provider of choice}' should help.

# License and credit
This project is licenced under the MIT License. An acknowledgement on your bot's Twitter profile is appreciated but not necessary.

If you'd like to, you can support me on Ko-Fi:

<a href='https://ko-fi.com/R5R2CWXB1' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

# Bots powered by this project
As well as the bots I run - [@UKGovAltBot](https://twitter.com/UKGovAltBot), [@UKCouncilAltBot](https://twitter.com/UKCouncilAltBot) and [@USGovAltBot](https://twitter.com/USGovAltBot) - the following bots are also using this engine:
- [@plymbot](https://twitter.com/plymbot)
- [@AltTextWatch](https://twitter.com/AltTextWatch)
- [@NHSchecker](https://twitter.com/NHSchecker)
