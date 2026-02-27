"""Debug script to test matching pipeline."""
import requests

BASE = "http://localhost:8000/api"

# Login as company
r = requests.post(f"{BASE}/auth/login", json={"email": "hr@technova.com", "password": "Demo@123"}, timeout=10)
company_token = r.json()["access_token"]
print("Company login OK")

# Get opportunities
r2 = requests.get(f"{BASE}/company/opportunities", headers={"Authorization": f"Bearer {company_token}"}, timeout=10)
opps = r2.json()["opportunities"]
print(f"Found {len(opps)} opportunities")
for o in opps:
    print(f"  {o['id']}: {o['title']} ({o['total_applicants']} applicants)")

# Login as Arjun to check his skills
r3 = requests.post(f"{BASE}/auth/login", json={"email": "arjun@gmail.com", "password": "Demo@123"}, timeout=10)
arjun_token = r3.json()["access_token"]
r4 = requests.get(f"{BASE}/student/profile", headers={"Authorization": f"Bearer {arjun_token}"}, timeout=10)
profile = r4.json()
print(f"\nArjun's skill profile ({len(profile.get('skill_profile', {}))} skills):")
for skill, data in list(profile.get("skill_profile", {}).items())[:15]:
    print(f"  {skill}: score={data['score']}")
print(f"Resume parse status: {profile.get('resume_parse_status')}")

# Trigger matching on first opportunity
if opps:
    opp_id = opps[0]["id"]
    print(f"\nTriggering matching for: {opp_id} ({opps[0]['title']})")
    r5 = requests.post(f"{BASE}/matching/run/{opp_id}", headers={"Authorization": f"Bearer {company_token}"}, timeout=30)
    print(f"Status: {r5.status_code}")
    print(f"Response: {r5.text}")

    # Check rankings after matching
    r6 = requests.get(f"{BASE}/company/opportunities/{opp_id}/rankings", headers={"Authorization": f"Bearer {company_token}"}, timeout=10)
    rankings = r6.json()
    print(f"\nRankings after matching:")
    for rank in rankings.get("rankings", []):
        print(f"  {rank['student_name']}: score={rank['match_score']}, rank={rank.get('rank')}, knockout={rank.get('knockout_passed')}, fail={rank.get('knockout_fail_reason')}")
