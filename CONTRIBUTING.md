# Contributing to Firekeeper

PRs welcome!

# Installation

Node >= 14.x and Yarn should be installed. On macOS, these are available via [Homebrew](https://brew.sh/).

This project uses Yarn 2. Please follow the steps at https://yarnpkg.com/getting-started/install

# Code style

This project uses [Prettier](https://prettier.io) and includes the necessary configuration for the [VSCode extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). Please enable formatting on save using Prettier in your editor, if possible.

# Testing without affecting existing infrastructure

To test, copy `firewall.example.yml` and remove both the `droplet_ids` and `tags` keys on the root level, and any `droplet_ids` or `load_balancer_uids` used as sources or destinations. When running `yarn deploy`, this will create a Cloud Firewall that isn't associated with any resources. You can iterate on this firewall or add others, and remove them manually when done. Cloud Firewalls are free, so this will not incur any cost.
