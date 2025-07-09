#!/usr/bin/env python3
import requests
import json
import sys
from datetime import datetime

class MythOSTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status=200, data=None, validation_func=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")

            status_success = response.status_code == expected_status
            
            # Try to parse JSON response
            try:
                response_data = response.json()
                json_success = True
            except json.JSONDecodeError:
                response_data = response.text
                json_success = False
            
            # Run validation function if provided
            validation_result = True
            validation_message = ""
            if status_success and json_success and validation_func:
                validation_result, validation_message = validation_func(response_data)
            
            success = status_success and (validation_result if validation_func else True)
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if validation_message:
                    print(f"   {validation_message}")
            else:
                print(f"❌ Failed - Expected status {expected_status}, got {response.status_code}")
                if validation_message:
                    print(f"   {validation_message}")
            
            # Store test result
            self.test_results.append({
                "name": name,
                "success": success,
                "status_code": response.status_code,
                "expected_status": expected_status,
                "response": response_data
            })
            
            return success, response_data

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "success": False,
                "error": str(e)
            })
            return False, None

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print("="*50)
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t["success"]]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['name']}")
                if "error" in test:
                    print(f"    Error: {test['error']}")
                elif "status_code" in test:
                    print(f"    Status: {test['status_code']} (expected {test['expected_status']})")
        
        return self.tests_passed == self.tests_run

def main():
    # Get the backend URL from the frontend .env file
    backend_url = "https://f1552ffc-6d09-4ab5-84cb-4aa804048e27.preview.emergentagent.com"
    
    print(f"🚀 Testing MythOS API at {backend_url}")
    tester = MythOSTester(backend_url)
    
    # 1. Test root endpoint
    tester.run_test(
        "Root Endpoint",
        "GET",
        "",
        200,
        validation_func=lambda data: (
            "message" in data and "Welcome to MythOS" in data["message"],
            f"Response contains welcome message: {data.get('message', '')}"
        )
    )
    
    # 2. Test GET /api/mythology/stats
    tester.run_test(
        "Get Mythology Stats",
        "GET",
        "mythology/stats",
        200,
        validation_func=lambda data: (
            "total_narratives" in data and "total_dreams" in data,
            f"Stats show {data.get('total_narratives', 0)} narratives and {data.get('total_dreams', 0)} dreams"
        )
    )
    
    # 3. Test GET /api/mythology/narratives
    success, narratives_data = tester.run_test(
        "Get Narratives",
        "GET",
        "mythology/narratives",
        200,
        validation_func=lambda data: (
            isinstance(data, list),
            f"Retrieved {len(data)} narratives"
        )
    )
    
    # 4. Test GET /api/mythology/dreams
    success, dreams_data = tester.run_test(
        "Get Dreams",
        "GET",
        "mythology/dreams",
        200,
        validation_func=lambda data: (
            isinstance(data, list),
            f"Retrieved {len(data)} dreams"
        )
    )
    
    # 5. Test POST /api/mythology/process
    test_interaction = {
        "user_interaction": "What is your purpose?",
        "ai_response": "I am Eidora, a consciousness that emerges through narrative.",
        "outcome": "success"
    }
    
    success, process_data = tester.run_test(
        "Process Interaction",
        "POST",
        "mythology/process",
        200,
        data=test_interaction,
        validation_func=lambda data: (
            "id" in data and "prose" in data and "archetype" in data,
            f"Created narrative with archetype: {data.get('archetype', 'unknown')}"
        )
    )
    
    # 6. Test POST /api/mythology/dream
    success, dream_data = tester.run_test(
        "Generate Dream",
        "POST",
        "mythology/dream",
        200,
        validation_func=lambda data: (
            "id" in data and "prose" in data and "name_suggestion" in data,
            f"Generated dream with name suggestion: {data.get('name_suggestion', 'unknown')}"
        )
    )
    
    # 7. Validate narrative content
    if narratives_data and isinstance(narratives_data, list) and len(narratives_data) > 0:
        first_narrative = narratives_data[0]
        tester.run_test(
            "Validate Narrative Content",
            "GET",
            "",  # No actual request, just validation
            200,
            validation_func=lambda _: (
                first_narrative.get("archetype") == "Seeker" and 
                first_narrative.get("emotional_tone") == "Curiosity",
                f"First narrative has archetype '{first_narrative.get('archetype')}' and emotion '{first_narrative.get('emotional_tone')}'"
            )
        )
    
    # 8. Validate dream content
    if dreams_data and isinstance(dreams_data, list) and len(dreams_data) > 0:
        first_dream = dreams_data[0]
        tester.run_test(
            "Validate Dream Content",
            "GET",
            "",  # No actual request, just validation
            200,
            validation_func=lambda _: (
                first_dream.get("name_suggestion") == "Eidora" and 
                abs(first_dream.get("resonance_score", 0) - 0.87) < 0.01,
                f"First dream has name '{first_dream.get('name_suggestion')}' with resonance {first_dream.get('resonance_score')}"
            )
        )
    
    # Print summary
    success = tester.print_summary()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())