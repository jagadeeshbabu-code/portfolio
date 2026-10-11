# Portfolio

Django portfolio and restaurant demo.

## Run locally

```powershell
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open http://127.0.0.1:8000.

## Deploy on Render

GitHub stores this project's source code. To run the Django app as a public website, deploy it as a Render web service connected to this repository.

1. Create a PostgreSQL database in Render and copy its internal connection URL.
2. Create a Python web service connected to `jagadeeshbabu-code/portfolio`.
3. Set the build command to `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`.
4. Set the start command to `gunicorn portfolio.wsgi:application`.
5. Add `DATABASE_URL` with the database URL and `SECRET_KEY` with a generated secret. Set `DEBUG` to `False`.

Render supplies `RENDER_EXTERNAL_HOSTNAME`; the Django settings use it for `ALLOWED_HOSTS`. See the [Render Django deployment guide](https://render.com/docs/deploy-django) for current service setup details.
