# mugshot-services

# Setup
Update `collector/facebook/config.js` with your Facebook User Access Token. You will need to create a developer application that will post the content.

Copy `profiles/example-profile.js` and rename it and provide all required information. You can also pass some of this information as a command line argument.

You will need to figure out the Mobile Patrol API endpoint yourself, as this is not readily available. I recommend using a combination of a proxy, Fiddler and BlueStacks. Contact us if you would like some help with this.

# Run
I recommend using pm2 to run the script, but to start a single instance you can start it with `node collector --profile profile-name`

# License
The MIT License (MIT)

Copyright (c) 2018

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
