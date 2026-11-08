# Ad and campaign links

Every link we put in an ad or post carries UTM tags. The site records them and the backend uses them to credit each visit and test-drive lead to a channel. That's how the Insights page can tell Instagram ads apart from Google, WhatsApp shares and direct visits. A link without tags still works, but it's counted only as roughly "Instagram" (from the in-app browser) or "direct", and we can't see which ad brought the visitor.

## Instagram / Facebook ads (Meta Ads Manager)

In the ad's **Website URL**, link straight to the car (or `/cars`). Then paste this into **URL parameters**:

```
utm_source=instagram&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{placement}}
```

- Use `utm_source=facebook` for ads that run only on Facebook.
- Meta fills in `{{campaign.name}}`, `{{ad.name}}` and `{{placement}}` itself. Give campaigns and ads names the owner will recognise, such as `Diwali SUVs` or `Creta reel`. Those names are what the Insights page shows.
- Meta also adds `fbclid` on its own. Leave it in.

Example:

```
https://wheelsexperts.in/cars/<car-id>?utm_source=instagram&utm_medium=paid_social&utm_campaign=Diwali%20SUVs&utm_content=Creta%20reel
```

## Organic posts, stories and bio link

```
?utm_source=instagram&utm_medium=organic_social&utm_campaign=bio
```

For a story or post, set `utm_campaign` to something short like `story-creta-nov`.

## WhatsApp broadcasts and status

```
?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=<name>
```

## Rules

- Write `utm_source` and `utm_medium` in lowercase, exactly as above.
- Never put a buyer's name or phone number in a link.
- Test a new ad link once by opening it on a phone. The visit shows up under Insights → Traffic.
