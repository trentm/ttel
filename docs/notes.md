
## Other usages

Theoretically could "avoid" separate install step with `npx` to launch.
Though really an `npx`-based thing is only useful for dev and demo.

```
npx -y ttel node app.js
# Or even:
#   npx -y ttel app.js
```

When file-based config is supported:

```
export OTEL_CONFIG_FILE=./my-otel.yaml
export NODE_OPTIONS="--import=ttel"
node app.js
```

