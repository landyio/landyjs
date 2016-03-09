/* eslint no-unused-vars:0 */

var abResponseText = {
  'variation': {
    'value': '{\"elements\":[\"{\\\"selector\\\":\\\":nth-child(4) > :nth-child(1) > h1\\\",\\\"html\\\":\\\"Tool&lt;br&gt; or not to tool<fakebr>        &lt;small&gt;Landy is an essentially new way to deliver the best possible landing page &lt;br&gt; to every new visitor. Effortlessly and automatically.&lt;&#x2F;small&gt;<fakebr>      \\\"}\",\"{\\\"selector\\\":\\\":nth-child(4) > :nth-child(1) > a\\\",\\\"styles\\\":{\\\"background-color\\\":\\\"#888888\\\"},\\\"attributes\\\":{}}\",\"{\\\"selector\\\":\\\"main > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > img\\\",\\\"styles\\\":{\\\"display\\\":\\\"none\\\"},\\\"attributes\\\":{}}\",\"{\\\"selector\\\":\\\":nth-child(7) > :nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1)\\\",\\\"html\\\":\\\"<fakebr>              &lt;h4 class=&quot;h4&quot;&gt;Who kill Kenny?&lt;&#x2F;h4&gt;<fakebr>              &lt;p class=&quot;text-grey&quot;&gt;Not exactly. Landy applies machine learning algorithms to find the most convertible landing page for every single visitor based on their traits and behavior.&lt;&#x2F;p&gt;<fakebr>              &lt;h4 class=&quot;h4&quot;&gt;Why you&#39;re charging per prediction?&lt;&#x2F;h4&gt;<fakebr>              &lt;p class=&quot;text-grey&quot;&gt;The amount of traffic per test defines data size, which Landy needs to collect and process. More data you have - more computing power we need.&lt;&#x2F;p&gt;<fakebr>              &lt;h4 class=&quot;h4&quot;&gt;What will happen on April 1?&lt;&#x2F;h4&gt;<fakebr>              &lt;p class=&quot;text-grey&quot;&gt;Everyone will be moved to our free plan. It includes 10 000 predictions per month.&lt;&#x2F;p&gt;<fakebr>            \\\"}\",\"{\\\"selector\\\":\\\":nth-child(2) > input\\\",\\\"styles\\\":{},\\\"attributes\\\":{\\\"value\\\":\\\"Create or not to create\\\"}}\",\"{\\\"selector\\\":\\\"main > :nth-child(1) > :nth-child(1) > h2\\\",\\\"styles\\\":{},\\\"attributes\\\":{\\\"class\\\":\\\"h1\\\"}}\"]}',
    'id': '1146c3cc98ffed3bc271ff151457348626598'
  },
  'predicted': false
};

var splitResponseText = {
  'variation': {
    'value': '{\"url\":\"http://0.0.0.0:9001/_SpecRunner.html#redirect\"}',
    'id': 'aaea353a2d60a067d5c881071450064475211'
  },
  'predicted': true
};

var zaxResponses = {
  predict: {
    ab: {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(abResponseText)
    },
    split: {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(splitResponseText)
    }
  },
  finish: {
    status: 200,
    contentType: 'application/json'
  }
};