<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\UserParam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserParamController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show(UserParam $userParam)
    {
        return response()->json($userParam);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserParam $userParam)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'age' => 'nullable|integer|min:1|max:120',
            'gender' => 'nullable|integer|between:0,2',
            'phone' => 'nullable|string|max:20',
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($userParam->avatar) {
                Storage::delete('public/' . $userParam->avatar);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        $userParam->update($validated);

        return response()->json([
            'message' => 'User parameters updated successfully',
            'data' => $userParam->fresh()
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserParam $userParam)
    {
        // Delete avatar if exists
        if ($userParam->avatar) {
            Storage::delete('public/' . $userParam->avatar);
        }

        $userParam->delete();

        return response()->json(['message' => 'User parameters deleted successfully']);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        // Удаляем старый аватар
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Сохраняем новый
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = $path;
        $user->save();

        return response()->json([
            'url' => Storage::url($path),
            'path' => $path,
        ]);
    }
}
