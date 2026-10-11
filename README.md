# Portfolio

Django portfolio and restaurant demo.

## Run locally

```powershell
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open http://127.0.0.1:8000.

## Deploy a public preview

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jagadeeshbabu-code/portfolio)

Sign in to Render and use the button to create the web service from `render.yaml`. Render will provide a public `onrender.com` URL to share with reviewers.

This free preview uses SQLite, so account, order, reservation, and feedback data can reset when the service restarts or redeploys. Free Render web services also sleep when idle. For persistent app data, connect a PostgreSQL database using the [Render Django deployment guide](https://render.com/docs/deploy-django); free Render Postgres databases expire after 30 days.
