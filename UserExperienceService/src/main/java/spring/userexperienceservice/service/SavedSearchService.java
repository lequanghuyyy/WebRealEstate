package spring.userexperienceservice.service;

import spring.userexperienceservice.dto.request.SavedSearchRequest;
import spring.userexperienceservice.dto.response.SavedSearchResponse;

import java.util.List;

public interface SavedSearchService {
    SavedSearchResponse saveSearch(SavedSearchRequest request);
    List<SavedSearchResponse> getSavedSearches(String userId);
    void deleteSavedSearch(String id);
}
