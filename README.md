# Firekeeper

![Test status](https://github.com/Orclyx/firekeeper/workflows/tests/badge.svg)

Git-based management of DigitalOcean Cloud Firewalls. [View on GitHub](https://github.com/Orclyx/firekeeper)

# Usage

Add or edit YAML files in the `firewalls` directory to represent your desired firewall configuration. Commit your changes and push. That's it!

# One-time setup

- Clone this repository, or click "Use this template" on GitHub to copy it. Your new repository should be private.
- Delete `.github/workflows/test.yml`
- Copy `firewalls/firewall.example.yml`, give the new file a descriptive name and configure it to suit your needs. You can add additional configuration files, one for each firewall, within the `firewalls` directory.
- Create a [personal access token](https://www.digitalocean.com/docs/apis-clis/api/create-personal-access-token/) for DigitalOcean. What to do with this depends on your pipeline:

## Bitbucket Pipelines

- Add your DigitalOcean personal access token as a secured repository variable named `DIGITALOCEAN_ACCESS_TOKEN` at _Repository Settings → Pipelines → Repository variables_.
- Enable Pipelines for this repository within _Repository Settings → Pipelines → Settings_.
- Push committed configuration to the `master` branch.

## GitHub Actions

- Add your DigitalOcean personal access token as a secret named `DIGITALOCEAN_ACCESS_TOKEN` at _Settings → Secrets_.
- Select "Enable local and third party Actions for this repository" in _Settings → Actions_.
- Push committed configuration to the `master` branch.

## Other CI/CD pipeline

Make your DigitalOcean personal access token available as an environment variable named `DIGITALOCEAN_ACCESS_TOKEN` or add it to a file named `.env` in the deployed directory. See `.github/workflows/deploy.yml` and `bitbucket-pipelines.yml` for examples of how to install and run the worker.

# Help

## Adopting Firekeeper for pre-existing firewalls

Firekeeper intentionally doesn't interact with Cloud Firewalls set up by other means. To adopt Firekeeper for a pre-existing firewall, add a configuration file for it as normal and push.

You should now have two of functionally the same firewall attached to the same DigitalOcean resources. Once the new firewall is "Up-to-date" on all resources, delete the old firewall.

## Deleting configuration files

If you delete a configuration file for a Cloud Firewall, the firewall will not be deleted from DigitalOcean.

# Contributing

Please see CONTRIBUTING.md

# License

MIT
