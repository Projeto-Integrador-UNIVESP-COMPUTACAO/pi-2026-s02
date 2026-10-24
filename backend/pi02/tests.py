from unittest.mock import patch

from django.test import SimpleTestCase


class HealthCheckTests(SimpleTestCase):
    def test_health_returns_200_even_when_database_is_down(self):
        with patch("pi02.views.database_is_available", return_value=False):
            response = self.client.get("/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
        self.assertEqual(response.json()["database"], "error")

    def test_health_returns_database_ok(self):
        with patch("pi02.views.database_is_available", return_value=True):
            response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["database"], "ok")

    def test_health_is_available_at_root(self):
        with patch("pi02.views.database_is_available", return_value=True):
            response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_health_accepts_path_without_trailing_slash(self):
        with patch("pi02.views.database_is_available", return_value=True):
            response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_readiness_returns_503_when_database_is_down(self):
        with patch("pi02.views.database_is_available", return_value=False):
            response = self.client.get("/health/ready/")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["status"], "unavailable")

    def test_readiness_returns_200_when_database_is_up(self):
        with patch("pi02.views.database_is_available", return_value=True):
            response = self.client.get("/api/health/ready/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
